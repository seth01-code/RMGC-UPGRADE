"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import newRequest from "../../utils/newRequest";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaClosedCaptioning,
} from "react-icons/fa";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

interface TranscriptEntry {
  speakerId: string;
  speakerName: string;
  text: string;
  at: string;
}

// SpeechRecognition isn't in the standard TS lib DOM types across all
// configs, and only Chromium browsers expose it (often under the
// "webkit" prefix), so we look it up defensively at runtime.
const getSpeechRecognition = (): any => {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

// getUserMedia throws a DOMException whose `name` tells us exactly what
// went wrong. We surface that distinction to the user instead of a single
// generic message, since each case needs a different fix on their end.
const getMediaErrorMessage = (err: any): string => {
  switch (err?.name) {
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera or microphone was found on this device. Connect one and refresh the page to join.";
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera/microphone access was blocked. Allow access in your browser's site settings, then refresh.";
    case "NotReadableError":
    case "TrackStartError":
      return "Your camera or microphone is already in use by another app or browser tab. Close it and refresh.";
    case "OverconstrainedError":
      return "Your camera or microphone doesn't support the required settings. Try a different device.";
    default:
      return "Couldn't access camera/microphone, or the meeting link is invalid.";
  }
};

const MeetingRoom = () => {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [peerName, setPeerName] = useState("");
  const [myName, setMyName] = useState("");
  const [connected, setConnected] = useState(false);
  const [remoteCamOn, setRemoteCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [camAvailable, setCamAvailable] = useState(true);
  const [micAvailable, setMicAvailable] = useState(true);
  const [error, setError] = useState("");
  const [settingUp, setSettingUp] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // ── Transcript state ──
  const [transcriptOn, setTranscriptOn] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [liveCaption, setLiveCaption] = useState(""); // current in-progress (interim) line, mine only
  const [speechSupported, setSpeechSupported] = useState(true);
  const [captionsBlocked, setCaptionsBlocked] = useState(false);
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const myIdRef = useRef<string>("");
  const myNameRef = useRef<string>(""); // recognition callbacks need this without a stale closure
  const recognitionRef = useRef<any>(null);
  const transcriptOnRef = useRef(false); // mirrors transcriptOn for use inside onend's auto-restart
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        const me = await newRequest.get("/users/me");
        myIdRef.current = me.data.id;
        const name = me.data.username || me.data.name || "";
        setMyName(name);
        myNameRef.current = name;

        const meetingRes = await newRequest.get(`/meetings/${meetingId}`);
        const meeting = meetingRes.data;
        if (meeting.status !== "accepted" && meeting.status !== "completed") {
          setError("This meeting hasn't been accepted yet.");
          return;
        }
        setPeerName(meeting.peerUsername);
        // Hydrate any transcript lines already saved (e.g. rejoining a call)
        if (Array.isArray(meeting.transcript)) {
          setTranscript(meeting.transcript);
        }

        let stream: MediaStream;
        try {
          try {
            // Ask for both up front — this is the reliable path. Calling
            // enumerateDevices() before any permission grant exists for
            // this origin can mis-report which devices exist (e.g. some
            // browsers list the camera but not the mic until a prompt has
            // actually been accepted once), which previously caused us to
            // skip requesting audio even when a mic was present.
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            if (cancelled) return;
            setCamAvailable(true);
            setMicAvailable(true);
          } catch (bothErr: any) {
            // Only fall back to probing devices individually when the
            // failure looks like a genuinely missing device. Anything else
            // (permission denied, device busy, etc.) should surface as-is.
            if (
              bothErr?.name !== "NotFoundError" &&
              bothErr?.name !== "DevicesNotFoundError"
            ) {
              throw bothErr;
            }

            let videoStream: MediaStream | null = null;
            let audioStream: MediaStream | null = null;
            try {
              videoStream = await navigator.mediaDevices.getUserMedia({
                video: true,
              });
            } catch (_) {
              /* no camera available */
            }
            try {
              audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
              });
            } catch (_) {
              /* no mic available */
            }

            if (cancelled) return;
            if (!videoStream && !audioStream) {
              setError(
                "No camera or microphone was found on this device. Connect one and refresh the page to join.",
              );
              return;
            }

            stream = new MediaStream([
              ...(videoStream?.getTracks() ?? []),
              ...(audioStream?.getTracks() ?? []),
            ]);
            setCamAvailable(!!videoStream);
            setMicAvailable(!!audioStream);
            if (!videoStream) setCamOn(false);
            if (!audioStream) setMicOn(false);
          }
        } catch (mediaErr: any) {
          console.error("getUserMedia failed:", mediaErr);
          setError(getMediaErrorMessage(mediaErr));
          return;
        }
        if (cancelled) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setSettingUp(false);

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setConnected(true);

          // The remote video track fires "mute" when the sender stops
          // sending frames (i.e. they disabled their camera via
          // track.enabled = false) and "unmute" when frames resume.
          if (event.track.kind === "video") {
            setRemoteCamOn(!event.track.muted);
            event.track.onmute = () => setRemoteCamOn(false);
            event.track.onunmute = () => setRemoteCamOn(true);
          }
        };

        const socket = io("https://api.renewedmindsglobalconsult.com");
        socketRef.current = socket;

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("meeting:ice-candidate", {
              roomId: meetingId,
              candidate: event.candidate,
            });
          }
        };

        socket.emit("meeting:join", {
          roomId: meetingId,
          userId: myIdRef.current,
        });

        // Someone else just joined the room after me -> I offer to them
        socket.on("meeting:peer-joined", async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("meeting:offer", { roomId: meetingId, sdp: offer });
        });

        // I received an offer -> answer it
        socket.on("meeting:offer", async ({ sdp }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          for (const c of pendingCandidates.current)
            await pc.addIceCandidate(new RTCIceCandidate(c));
          pendingCandidates.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("meeting:answer", { roomId: meetingId, sdp: answer });
        });

        socket.on("meeting:answer", async ({ sdp }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          for (const c of pendingCandidates.current)
            await pc.addIceCandidate(new RTCIceCandidate(c));
          pendingCandidates.current = [];
        });

        socket.on("meeting:ice-candidate", async ({ candidate }) => {
          if (!pc.remoteDescription) {
            pendingCandidates.current.push(candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on("meeting:peer-left", () => {
          setConnected(false);
          setRemoteCamOn(true);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

        // Peer's finalized transcript lines arrive here (the server also
        // echoes my own lines back, but I already append those locally
        // when I capture them, so de-dupe on the way in).
        socket.on(
          "meeting:transcript",
          ({ entry }: { entry: TranscriptEntry }) => {
            if (entry.speakerId === myIdRef.current) return;
            setTranscript((prev) => [...prev, entry]);
          },
        );
      } catch (err) {
        console.error(err);
        setError(
          "Couldn't access camera/microphone, or the meeting link is invalid.",
        );
      }
    };

    setup();

    return () => {
      cancelled = true;
      socketRef.current?.emit("meeting:leave", {
        roomId: meetingId,
        userId: myIdRef.current,
      });
      socketRef.current?.disconnect();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      recognitionRef.current?.stop();
    };
  }, [meetingId]);

  // Re-attach the local stream to the PiP <video> element whenever it
  // (re)mounts: once after setup finishes (settingUp flips to false), and
  // again any time the camera is toggled back on (the <video> tag is
  // conditionally rendered, so toggling camOn unmounts/remounts it and the
  // srcObject assigned during setup is lost).
  useEffect(() => {
    if (
      !settingUp &&
      camOn &&
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [settingUp, camOn]);

  // Call duration timer, starts once the other side connects
  useEffect(() => {
    if (!connected) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [connected]);

  // Auto-scroll the transcript panel as new lines come in
  useEffect(() => {
    if (showTranscriptPanel) {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, liveCaption, showTranscriptPanel]);

  // ── Speech recognition: transcribes MY mic locally, posts finalized
  // lines to the backend (which persists + broadcasts to the peer) ──────────
  const startRecognition = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          submitTranscriptLine(text);
        } else {
          interim += text;
        }
      }
      setLiveCaption(interim);
    };

    recognition.onerror = (event: any) => {
      // "no-speech" and "aborted" are routine (e.g. silence, or we just
      // called stop()) — anything else is worth knowing about, but we
      // don't want to kill the whole call over a flaky recognizer.
      if (event.error === "no-speech" || event.error === "aborted") return;

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        // Mic access for live captions was denied (or the browser blocked
        // this particular start() call for lacking a fresh user gesture,
        // which auto-restart can't provide). Retrying is futile and just
        // keeps re-requesting the mic — stop instead of looping forever.
        console.warn(
          "Speech recognition permission denied; disabling captions.",
        );
        transcriptOnRef.current = false;
        setTranscriptOn(false);
        setLiveCaption("");
        setCaptionsBlocked(true);
        return;
      }

      console.warn("Speech recognition error:", event.error);
    };

    // Some browsers stop the recognizer automatically after a pause;
    // restart it for as long as the user wants transcription on.
    recognition.onend = () => {
      if (transcriptOnRef.current) {
        try {
          recognition.start();
        } catch (_) {
          /* already starting */
        }
      }
    };

    try {
      recognition.start();
    } catch (_) {
      /* ignore double-start */
    }
    recognitionRef.current = recognition;
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setLiveCaption("");
  };

  const submitTranscriptLine = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const entry: TranscriptEntry = {
      speakerId: myIdRef.current,
      speakerName: myNameRef.current,
      text: trimmed,
      at: new Date().toISOString(),
    };

    // Show it immediately rather than waiting on the round-trip
    setTranscript((prev) => [...prev, entry]);

    try {
      await newRequest.post(`/meetings/${meetingId}/transcript`, {
        text: trimmed,
        speakerName: myNameRef.current,
      });
    } catch (err) {
      console.error("Failed to save transcript line:", err);
    }
  };

  const toggleTranscript = () => {
    const next = !transcriptOn;
    transcriptOnRef.current = next;
    setTranscriptOn(next);
    setShowTranscriptPanel(next || showTranscriptPanel);
    if (next) {
      startRecognition();
    } else {
      stopRecognition();
    }
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const formatClock = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Builds up to 2 initials from a name/username, e.g. "Jane Doe" -> "JD",
  // "jane_doe" -> "J", falls back to "?" when nothing usable is available.
  const getInitials = (name: string) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.charAt(0).toUpperCase();
  };

  const toggleMic = () => {
    if (!micAvailable) return;
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    if (!camAvailable) return;
    localStreamRef.current
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  };

  const leave = async () => {
    try {
      await newRequest.patch(`/meetings/${meetingId}/complete`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {}
    router.push("/meetings");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center text-white px-4">
        <div className="text-center max-w-sm flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
            <FaVideoSlash className="text-[20px] text-white/40" />
          </div>
          <p className="text-[15px] font-semibold text-white/90">{error}</p>
          <button
            onClick={() => router.push("/meetings")}
            className="text-[13px] font-bold bg-white text-[#202124] px-5 py-2.5 rounded-full hover:bg-white/90 transition"
          >
            Back to meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#202124] flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
          <p className="text-[13px] font-semibold text-white/70">
            {connected ? formatElapsed(elapsed) : "Not yet connected"}
          </p>
        </div>
        <p className="text-[12.5px] font-semibold text-white/40">
          {peerName ? `Meeting with ${peerName}` : "Meeting"}
        </p>
      </div>

      {/* ── Stage + optional transcript side panel ── */}
      <div className="flex-1 px-5 pb-3 flex gap-3 min-h-0">
        <div className="flex-1 relative min-w-0">
          {settingUp ? (
            <div className="w-full h-full rounded-2xl bg-[#28292c] flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
              <p className="text-[13px] font-semibold text-white/40">
                Setting up camera and mic…
              </p>
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-[#28292c] relative">
              {/* Remote video tile */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {!connected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <span className="text-[22px] font-black text-orange-400">
                      {getInitials(peerName)}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-white/40">
                    Waiting for {peerName || "the other participant"} to join…
                  </p>
                </div>
              )}

              {connected && !remoteCamOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#28292c]">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <span className="text-[22px] font-black text-orange-400">
                      {getInitials(peerName)}
                    </span>
                  </div>
                </div>
              )}

              {/* Remote name chip */}
              {connected && (
                <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur-sm text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg">
                  {peerName}
                </div>
              )}

              {/* Live caption overlay (my own in-progress speech only) */}
              {transcriptOn && liveCaption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[80%] bg-black/65 backdrop-blur-sm text-white text-[13px] px-4 py-2 rounded-xl text-center">
                  {liveCaption}
                </div>
              )}

              {/* Local PiP tile */}
              <div className="absolute top-4 right-4 w-32 h-20 md:w-48 md:h-28 rounded-xl overflow-hidden bg-[#1c1d1f] border border-white/10 shadow-2xl">
                {camOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                    <span className="text-[18px] font-black text-orange-400">
                      {getInitials(myName)}
                    </span>
                  </div>
                )}
                {/* Local name chip */}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/55 backdrop-blur-sm px-2 py-0.5 rounded-md">
                  <span className="text-[10px] font-semibold text-white">
                    You
                  </span>
                  {!micOn && (
                    <FaMicrophoneSlash className="text-[8px] text-red-400" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Transcript panel ── */}
        {showTranscriptPanel && (
          <div className="w-72 shrink-0 hidden sm:flex flex-col bg-[#28292c] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <p className="text-[13px] font-bold text-white/90">
                Live transcript
              </p>
              <button
                onClick={() => setShowTranscriptPanel(false)}
                className="text-[11px] font-semibold text-white/40 hover:text-white/70 transition"
              >
                Hide
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
              {!speechSupported ? (
                <p className="text-[12px] text-white/40 leading-relaxed">
                  Your browser doesn't support live speech-to-text. Try Chrome
                  or Edge to caption your own audio.
                </p>
              ) : captionsBlocked ? (
                <p className="text-[12px] text-white/40 leading-relaxed">
                  Microphone access for captions was blocked. Check your
                  browser's site settings to allow it, then refresh — your call
                  audio is unaffected either way.
                </p>
              ) : transcript.length === 0 ? (
                <p className="text-[12px] text-white/40 leading-relaxed">
                  Nothing captured yet. Turn captions on and start talking —
                  your words are saved automatically.
                </p>
              ) : (
                transcript.map((entry, idx) => {
                  const mine = entry.speakerId === myIdRef.current;
                  return (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-[11px] font-bold ${mine ? "text-orange-400" : "text-white/60"}`}
                        >
                          {mine ? "You" : entry.speakerName || peerName}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {formatClock(entry.at)}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-white/85 leading-snug">
                        {entry.text}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="pb-7 pt-2 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-[#28292c] rounded-full px-4 py-2.5 shadow-2xl">
          <button
            onClick={toggleMic}
            title={
              !micAvailable
                ? "No microphone detected"
                : micOn
                  ? "Mute"
                  : "Unmute"
            }
            disabled={!micAvailable}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed ${
              micOn
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-white text-[#28292c]"
            }`}
          >
            {micOn ? (
              <FaMicrophone className="text-[15px]" />
            ) : (
              <FaMicrophoneSlash className="text-[15px]" />
            )}
          </button>
          <button
            onClick={toggleCam}
            title={
              !camAvailable
                ? "No camera detected"
                : camOn
                  ? "Turn off camera"
                  : "Turn on camera"
            }
            disabled={!camAvailable}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed ${
              camOn
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-white text-[#28292c]"
            }`}
          >
            {camOn ? (
              <FaVideo className="text-[15px]" />
            ) : (
              <FaVideoSlash className="text-[15px]" />
            )}
          </button>
          <button
            onClick={() => {
              if (!showTranscriptPanel) setShowTranscriptPanel(true);
              toggleTranscript();
            }}
            title={
              captionsBlocked
                ? "Caption mic access was blocked"
                : transcriptOn
                  ? "Turn off captions"
                  : "Turn on captions"
            }
            disabled={!speechSupported || captionsBlocked}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed ${
              transcriptOn
                ? "bg-orange-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <FaClosedCaptioning className="text-[15px]" />
          </button>
          <div className="w-px h-7 bg-white/10 mx-1" />
          <button
            onClick={leave}
            title="Leave call"
            className="px-5 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 transition"
          >
            <FaPhoneSlash className="text-[15px]" />
            <span className="text-[13px] font-bold hidden sm:inline">
              Leave
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
