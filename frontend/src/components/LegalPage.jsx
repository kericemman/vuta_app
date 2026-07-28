const legalDocuments = {
  privacy: {
    eyebrow: "Privacy Policy",
    title: "How Vuta handles your information",
    intro:
      "This Privacy Policy explains the information Vuta collects, how it is used, and the choices users have when using Vuta websites, mobile apps, and related services.",
    lastUpdated: "July 28, 2026",
    sections: [
      {
        title: "Information we collect",
        body: [
          "We may collect account details such as name, email address, phone number, country, city, profile photo, role, and business or professional profile information.",
          "Clients, professionals, and businesses may provide booking details, service preferences, portfolio images, messages, reviews, feedback, update interactions, and support requests.",
          "With permission, Vuta may collect approximate or precise location data to help users discover relevant services and providers. Location access can be changed from device settings.",
        ],
      },
      {
        title: "How we use information",
        body: [
          "We use information to create accounts, show relevant providers and services, process booking requests, support messaging, manage profile verification, display updates, improve safety, and respond to support needs.",
          "We may use contact details to send important account, booking, security, product, waitlist, and service notifications.",
        ],
      },
      {
        title: "Sharing information",
        body: [
          "We share limited booking and profile details between clients, professionals, businesses, and assigned team members where needed to complete a service request.",
          "We may work with trusted service providers for hosting, analytics, email delivery, image storage, security monitoring, and customer support. These providers should only use the data needed to support Vuta.",
          "We may disclose information when required by law, to protect users, to investigate abuse, or to enforce Vuta policies.",
        ],
      },
      {
        title: "Images, messages, and content",
        body: [
          "Portfolio images, service images, profile photos, reviews, and business information may be visible to other users depending on account type and settings.",
          "Private messages are used to support user communication and may be reviewed only where necessary for safety, support, abuse prevention, or legal compliance.",
        ],
      },
      {
        title: "Retention and security",
        body: [
          "Vuta keeps information for as long as needed to provide services, meet legal obligations, resolve disputes, prevent fraud, and maintain accurate business records.",
          "We use reasonable technical and organizational safeguards to protect information, but no online service can guarantee absolute security.",
        ],
      },
      {
        title: "Your choices",
        body: [
          "Users may update eligible account details, manage permissions, opt out of non-essential communications, request account deletion, or contact Vuta about privacy questions.",
          "Some information, such as email addresses used for account security and identity, may be restricted from editing to prevent duplicate or fraudulent accounts.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms and Conditions",
    title: "The rules for using Vuta",
    intro:
      "These Terms and Conditions explain the basic rules that apply when you access or use Vuta websites, mobile apps, profiles, bookings, messaging, updates, and related services.",
    lastUpdated: "July 28, 2026",
    sections: [
      {
        title: "Using Vuta",
        body: [
          "Vuta helps clients discover beauty providers and helps professionals and businesses present services, portfolios, availability, and booking options.",
          "Users must provide accurate information, keep login details secure, and use Vuta in a lawful, respectful, and honest way.",
        ],
      },
      {
        title: "Accounts and eligibility",
        body: [
          "You are responsible for activity under your account. Vuta may refuse, suspend, restrict, or remove accounts that appear unsafe, fraudulent, misleading, abusive, or in breach of these terms.",
          "Professionals and businesses may be asked to submit profile details for review before receiving full marketplace visibility.",
        ],
      },
      {
        title: "Bookings and services",
        body: [
          "Bookings are service requests between clients and providers. Providers are responsible for the accuracy of service descriptions, prices, availability, location, staff details, and delivery of the selected service.",
          "Clients are responsible for reviewing service details before booking, attending appointments, communicating changes early, and treating providers respectfully.",
        ],
      },
      {
        title: "Payments and subscriptions",
        body: [
          "Client accounts may be free. Professional and business plans may require subscription fees. Pricing, billing periods, promotions, and included features may change as Vuta grows.",
          "Where third-party payment providers are used, their terms and processing rules may also apply.",
        ],
      },
      {
        title: "User content",
        body: [
          "Users are responsible for content they upload or publish, including photos, videos, descriptions, portfolio work, messages, updates, feedback, and reviews.",
          "By uploading content, you confirm that you have the right to share it and allow Vuta to display it where needed to operate the service.",
        ],
      },
      {
        title: "Safety and enforcement",
        body: [
          "Vuta may remove content, limit visibility, restrict features, investigate reports, or suspend accounts to protect users, prevent misuse, or maintain service quality.",
          "Vuta may update these terms as products, laws, pricing, and operating practices change.",
        ],
      },
    ],
  },
  agreement: {
    eyebrow: "User Agreement",
    title: "The agreement between Vuta and its users",
    intro:
      "This User Agreement sets expectations for clients, professionals, and businesses using Vuta to discover, promote, message, manage, or request beauty services.",
    lastUpdated: "July 28, 2026",
    sections: [
      {
        title: "Agreement to use Vuta",
        body: [
          "By creating an account, joining early access, submitting a profile, sending a message, or requesting a booking, you agree to follow Vuta policies and use the platform responsibly.",
          "If you use Vuta on behalf of a salon, spa, barbershop, company, or team, you confirm that you are allowed to act for that business.",
        ],
      },
      {
        title: "Client commitments",
        body: [
          "Clients agree to provide accurate booking details, communicate respectfully, avoid false reviews, and only request services they genuinely intend to attend or complete.",
          "Clients should review provider profiles, service descriptions, prices, availability, location, and cancellation expectations before requesting a booking.",
        ],
      },
      {
        title: "Professional commitments",
        body: [
          "Professionals agree to provide honest profile information, accurate service details, real portfolio images, current availability, and respectful client communication.",
          "Professionals are responsible for the services they offer, including quality, timing, hygiene, location, pricing, and any required local permissions or standards.",
        ],
      },
      {
        title: "Business commitments",
        body: [
          "Businesses agree to manage their business profile, employees, services, team availability, booking responses, customer communication, and published updates responsibly.",
          "Approved business names should remain accurate. If an approved business needs a name change, Vuta may request a reason and review it before approval.",
        ],
      },
      {
        title: "Messaging, reviews, and feedback",
        body: [
          "Users agree not to send abusive, deceptive, illegal, spam, or unsafe messages. Reviews and feedback should be honest and based on real experiences.",
          "Vuta may use feedback to improve the product, support users, and prioritize features, fixes, safety improvements, and launch planning.",
        ],
      },
      {
        title: "Account closure",
        body: [
          "Users may request account deletion from account settings or by contacting Vuta. Some records may be retained where needed for security, legal, billing, fraud prevention, or operational reasons.",
          "Vuta may restrict or close accounts that create risk for users, the platform, or the wider Vuta community.",
        ],
      },
    ],
  },
};

const LegalPage = ({ documentKey }) => {
  const document = legalDocuments[documentKey] || legalDocuments.terms;

  return (
    <>
      <section className="bg-[#FFF8F3] px-5 pb-8 pt-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
            {document.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#211A20] md:text-6xl">
            {document.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            {document.intro}
          </p>
          <p className="mt-4 text-sm font-semibold text-[#741B5D]">
            Last updated: {document.lastUpdated}
          </p>
        </div>
      </section>

      <section className="bg-white px-5 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          {document.sections.map((section) => (
            <article
              className="border border-[#F2D3BD] bg-[#FFF8F3] p-6"
              key={section.title}
            >
              <h2 className="text-2xl font-black text-[#211A20]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-stone-700 md:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}

          <article className="border border-[#741B5D]/15 bg-[#741B5D] p-6 text-white">
            <h2 className="text-2xl font-black">Contact Vuta</h2>
            <p className="mt-3 text-sm leading-7 text-[#FFF8F3] md:text-base">
              For questions about this policy or your account, contact the Vuta
              team through the official website or support channels provided in
              the app.
            </p>
          </article>
        </div>
      </section>
    </>
  );
};

export default LegalPage;
