export default function Head() {
  const siteName = "RMGC - Renewed Minds Global Consult";
  const siteUrl = "https://www.renewedmindsglobalconsult.com";
  const description =
    "Renewed Minds Global Consult (RMGC) connects freelancers, organizations, and remote workers across the world — empowering talents, fostering innovation, and creating global opportunities.";
  const keywords =
    "freelance marketplace, global consult, remote work, online jobs, hire freelancers, professional services, organizations, RMGC, Renewed Minds Global Consult, job portal, Africa freelancers, global hiring platform";

  const image = `${siteUrl}/assets/logoo-18848d4b.webp`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Renewed Minds Global Consult",
    alternateName: "RMGC",
    url: siteUrl,
    logo: `${siteUrl}/assets/logoo-18848d4b.webp`,
    sameAs: [
      "https://www.facebook.com/renewedmindsglobalconsult",
      "https://www.linkedin.com/company/rmgconsult",
      "https://x.com/rmgconsult_",
      "https://www.instagram.com/rmgconsult_",
    ],
    description: description,
    foundingDate: "2021",
    founder: {
      "@type": "Person",
      name: "Miracle Ikhielea",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@renewedmindsglobalconsult.com",
      url: siteUrl,
    },
  };

  return (
    <>
      {/* Basic SEO */}
      <title>{siteName}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Renewed Minds Global Consult" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

      {/* Canonical */}
      <link rel="canonical" href={siteUrl} />

      {/* Favicon & App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#1dbfb7" />

      {/* Open Graph (Facebook, LinkedIn, WhatsApp) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={siteName} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@rmgc_official" />
      <meta name="twitter:title" content={siteName} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Mobile Web App Config */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="RMGC" />

      {/* Structured Data (Schema.org) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Prefetch DNS for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    </>
  );
}
