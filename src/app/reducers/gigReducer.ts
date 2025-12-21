// types/gigReducer.ts
export interface GigState {
  userId?: string;
  title: string;
  cat: string;
  cover: string;
  images: string[];
  videos?: string[];
  documents?: string[];
  desc: string;
  shortTitle: string;
  shortDesc: string;
  deliveryTime: number;
  revisionNumber: number;
  features: string[];
  price: number;
}

// Discriminated union for reducer actions
export type GigAction =
  | {
      type: "CHANGE_INPUT";
      payload: { name: keyof GigState; value: any };
    }
  | {
      type: "ADD_IMAGES";
      payload: {
        cover: string;
        images: string[];
        videos?: string[];
        documents?: string[];
      };
    }
  | { type: "ADD_FEATURE"; payload: string }
  | { type: "REMOVE_FEATURE"; payload: string };

export const INITIAL_STATE: GigState = {
  userId:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")?._id
      : undefined,
  title: "",
  cat: "",
  cover: "",
  images: [],
  videos: [],
  documents: [],
  desc: "",
  shortTitle: "",
  shortDesc: "",
  deliveryTime: 0,
  revisionNumber: 0,
  features: [],
  price: 0,
};

export const gigReducer = (state: GigState, action: GigAction): GigState => {
  switch (action.type) {
    case "CHANGE_INPUT":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };

    case "ADD_IMAGES":
      return {
        ...state,
        cover: action.payload.cover,
        images: action.payload.images,
        videos: action.payload.videos || [],
        documents: action.payload.documents || [],
      };

    case "ADD_FEATURE":
      return {
        ...state,
        features: [...state.features, action.payload],
      };

    case "REMOVE_FEATURE":
      return {
        ...state,
        features: state.features.filter(
          (feature) => feature !== action.payload
        ),
      };

    default:
      return state;
  }
};
