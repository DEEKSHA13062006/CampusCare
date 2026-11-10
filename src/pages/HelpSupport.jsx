import { useMemo, useState } from "react";

import {
Search,
BookOpen,
FilePlus2,
ClipboardList,
UserRound,
ChevronDown,
ChevronRight,
MessageCircle,
Mail,
Clock3,
ArrowUpRight,
CircleHelp,
ShieldCheck,
ThumbsUp,
ThumbsDown,
Send,
X,
CheckCircle2,
LifeBuoy,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./HelpSupport.css";

const faqCategories = [
"All topics",
"Reporting issues",
"Tracking reports",
"Account & security",
];

const faqs = [
{
category: "Reporting issues",
question: "How do I report a campus maintenance issue?",
answer:
"Open Report an Issue from the sidebar or dashboard. Enter a descriptive title, choose the appropriate category, specify the building and room, describe the problem, and submit your report. Keep the complaint ID so you can track its progress.",
},
{
category: "Reporting issues",
question: "What information should I include in a report?",
answer:
"Include a clear title, exact location, issue category, and a description of what happened. A photograph can help the maintenance team understand the problem. Avoid including passwords, personal documents, or unrelated sensitive information.",
},
{
category: "Reporting issues",
question: "Which priority should I choose?",
answer:
"Choose Low for minor issues, Medium for routine repairs, High for problems that significantly affect a classroom or facility, and Critical for urgent safety or infrastructure concerns. Follow your college's emergency procedures for immediate danger rather than relying on a maintenance report alone.",
},
{
category: "Tracking reports",
question: "How can I track my complaint?",
answer:
"Open My Reports to review your submitted complaints. Select a report to see its current status and any available updates. Keep your complaint ID for reference when contacting support.",
},
{
category: "Tracking reports",
question: "What do the different statuses mean?",
answer:
"Reported means the complaint has been submitted. Assigned means it has been allocated to a maintenance team member. In Progress means work has started. Resolved means the reported work has been marked complete. Verified and Closed indicate the final review and closure stages when those steps are enabled.",
},
{
category: "Tracking reports",
question: "What should I do if an issue is marked resolved but is not fixed?",
answer:
"Open the report and check whether a reopen or feedback option is available. Explain what remains unresolved and provide a new photograph if appropriate. If that option is unavailable, contact campus support with your complaint ID.",
},
{
category: "Account & security",
question: "How do I protect my CampusCare account?",
answer:
"Use a strong, unique password and never share it with another person. Sign out on shared computers and contact the administrator if you notice unfamiliar activity. CampusCare support should never need your password.",
},
{
category: "Account & security",
question: "What if I cannot sign in?",
answer:
"Check that your email address and password are entered correctly. If sign-in still fails, use the available password recovery option or contact support. Include the error message in your request, but never include your password.",
},
];

const quickLinks = [
{
icon: FilePlus2,
title: "Report an issue",
description: "Submit a new maintenance request.",
action: "report",
},
{
icon: ClipboardList,
title: "Track my reports",
description: "Check complaint status and updates.",
action: "reports",
},
{
icon: UserRound,
title: "Account assistance",
description: "Get help with sign-in and your profile.",
action: "account",
},
];

function HelpSupport() {
const [search, setSearch] = useState("");
const [activeCategory, setActiveCategory] = useState("All topics");
const [openFaq, setOpenFaq] = useState(0);
const [helpfulVotes, setHelpfulVotes] = useState({});
const [showContact, setShowContact] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [form, setForm] = useState({
category: "General question",
subject: "",
email: "",
complaintId: "",
message: "",
});

const filteredFaqs = useMemo(() => {
const query = search.trim().toLowerCase();


return faqs.filter((faq) => {
  const matchesCategory =
    activeCategory === "All topics" ||
    faq.category === activeCategory;

  const matchesSearch =
    !query ||
    faq.question.toLowerCase().includes(query) ||
    faq.answer.toLowerCase().includes(query) ||
    faq.category.toLowerCase().includes(query);

  return matchesCategory && matchesSearch;
});


}, [search, activeCategory]);

function handleQuickLink(action) {
if (action === "report") {
window.location.href = "/report";
} else if (action === "reports") {
window.location.href = "/reports";
} else {
setForm((current) => ({
...current,
category: "Account & sign-in",
}));
setShowContact(true);
}
}

function handleSubmit(event) {
event.preventDefault();


if (
  !form.subject.trim() ||
  !form.email.trim() ||
  !form.message.trim()
) {
  return;
}

// Frontend demonstration only: no support request is sent or saved.
setSubmitted(true);


}

function closeContact() {
setShowContact(false);
setSubmitted(false);
}

return ( <div className="app-layout"> <Sidebar />


  <div className="main-area">
    <Topbar />

    <main className="help-page">
      <section className="help-hero">
        <div className="help-hero-content">
          <span className="help-eyebrow">
            <LifeBuoy size={15} />
            CAMPUSCARE SUPPORT
          </span>

          <h1>How can we help you?</h1>

          <p>
            Find answers, learn how CampusCare works, or get help
            with a maintenance report.
          </p>

          <div className="help-search">
            <Search size={20} />

            <input
              type="search"
              placeholder="Search for answers, topics, or questions..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenFaq(-1);
              }}
              aria-label="Search help articles"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <span className="search-hint">HELP</span>
          </div>

          <div className="hero-footnote">
            <ShieldCheck size={15} />
            <span>Here to help you keep your campus running smoothly.</span>
          </div>
        </div>

        <div className="hero-decoration" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-icon">
            <CircleHelp size={66} strokeWidth={1.2} />
          </div>
          <div className="floating-help-card">
            <CheckCircle2 size={18} />
            <div>
              <strong>Need assistance?</strong>
              <span>We're here to guide you.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="help-quick-grid">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="help-quick-card"
              key={item.title}
              onClick={() => handleQuickLink(item.action)}
              type="button"
            >
              <span className="quick-card-icon">
                <Icon size={21} />
              </span>

              <span className="quick-card-copy">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>

              <ArrowUpRight
                size={18}
                className="quick-card-arrow"
              />
            </button>
          );
        })}
      </section>

      <section className="help-content-grid">
        <div className="help-faq-panel">
          <div className="help-section-heading">
            <div>
              <span className="section-kicker">KNOWLEDGE BASE</span>
              <h2>Frequently asked questions</h2>
              <p>Quick answers to common questions.</p>
            </div>

            <span className="faq-count">
              {filteredFaqs.length} articles
            </span>
          </div>

          <div className="faq-categories">
            {faqCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "faq-category active"
                    : "faq-category"
                }
                onClick={() => {
                  setActiveCategory(category);
                  setOpenFaq(-1);
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="faq-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <article
                    className={`faq-item ${isOpen ? "expanded" : ""}`}
                    key={faq.question}
                  >
                    <button
                      className="faq-question"
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFaq(isOpen ? -1 : index)
                      }
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={19}
                        className="faq-chevron"
                      />
                    </button>

                    {isOpen && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>

                        <div className="faq-feedback">
                          <span>Was this helpful?</span>

                          <button
                            type="button"
                            className={
                              helpfulVotes[faq.question] === "yes"
                                ? "vote-button selected"
                                : "vote-button"
                            }
                            onClick={() =>
                              setHelpfulVotes((current) => ({
                                ...current,
                                [faq.question]: "yes",
                              }))
                            }
                            aria-label="This answer was helpful"
                          >
                            <ThumbsUp size={14} />
                            Yes
                          </button>

                          <button
                            type="button"
                            className={
                              helpfulVotes[faq.question] === "no"
                                ? "vote-button selected"
                                : "vote-button"
                            }
                            onClick={() =>
                              setHelpfulVotes((current) => ({
                                ...current,
                                [faq.question]: "no",
                              }))
                            }
                            aria-label="This answer was not helpful"
                          >
                            <ThumbsDown size={14} />
                            No
                          </button>
                        </div>

                        {helpfulVotes[faq.question] && (
                          <p className="vote-thanks">
                            Thank you for your feedback.
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="faq-empty">
                <Search size={27} />
                <h3>No matching answers</h3>
                <p>
                  Try another search term or choose a different topic.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All topics");
                    setOpenFaq(0);
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="faq-bottom-help">
            <div className="faq-bottom-icon">
              <MessageCircle size={20} />
            </div>

            <div>
              <strong>Still have a question?</strong>
              <p>Tell us what you need help with.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowContact(true)}
            >
              Contact support
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <aside className="help-sidebar-content">
          <div className="support-card">
            <div className="support-card-icon">
              <MessageCircle size={23} />
            </div>

            <span className="section-kicker">PERSONAL ASSISTANCE</span>
            <h3>Need a helping hand?</h3>

            <p>
              Can't find the answer? Send the campus support team
              your question and relevant complaint details.
            </p>

            <button
              type="button"
              className="support-primary-button"
              onClick={() => setShowContact(true)}
            >
              <Mail size={17} />
              Contact support
            </button>

            <div className="support-divider" />

            <div className="support-detail">
              <Clock3 size={17} />
              <div>
                <strong>Response time</strong>
                <span>
                  Response times depend on campus support availability.
                </span>
              </div>
            </div>
          </div>

          <div className="help-guides-card">
            <div className="guide-heading">
              <BookOpen size={19} />
              <h3>Helpful guides</h3>
            </div>

            <button
              type="button"
              className="guide-link"
              onClick={() => {
                setSearch("report");
                setActiveCategory("Reporting issues");
                setOpenFaq(-1);
              }}
            >
              <span>How to report an issue</span>
              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              className="guide-link"
              onClick={() => {
                setSearch("track");
                setActiveCategory("Tracking reports");
                setOpenFaq(-1);
              }}
            >
              <span>Understanding report status</span>
              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              className="guide-link"
              onClick={() => {
                setSearch("account");
                setActiveCategory("Account & security");
                setOpenFaq(-1);
              }}
            >
              <span>Account and security</span>
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="help-note">
            <ShieldCheck size={19} />
            <p>
              <strong>Urgent safety issue?</strong>
              <br />
              Contact campus security or the appropriate emergency
              service immediately. Do not wait for an online response.
            </p>
          </div>
        </aside>
      </section>

      <footer className="help-footer">
        <span>CampusCare Help Centre</span>
        <span>Smart campus. Faster resolution.</span>
      </footer>
    </main>
  </div>

  {showContact && (
    <div
      className="contact-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeContact();
        }
      }}
    >
      <section
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          type="button"
          className="contact-modal-close"
          onClick={closeContact}
          aria-label="Close contact form"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="contact-success">
            <div className="success-icon">
              <CheckCircle2 size={35} />
            </div>

            <h2>Request details captured</h2>

            <p>
              This demonstration has validated your form. It has not
              been sent to a support team or saved to a database yet.
            </p>

            <button
              type="button"
              className="support-primary-button"
              onClick={closeContact}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="contact-modal-heading">
              <span className="modal-icon">
                <Send size={21} />
              </span>

              <span className="section-kicker">WE'RE HERE TO HELP</span>
              <h2 id="contact-modal-title">Contact support</h2>
              <p>
                Describe your question or problem. Include a complaint
                ID if your request relates to a maintenance report.
              </p>
            </div>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <label>
                Request category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                >
                  <option>General question</option>
                  <option>Report tracking</option>
                  <option>Account & sign-in</option>
                  <option>Technical problem</option>
                  <option>Feedback or suggestion</option>
                </select>
              </label>

              <label>
                Subject
                <input
                  type="text"
                  placeholder="Briefly describe your request"
                  value={form.subject}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      subject: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Your email
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Complaint ID
                <span className="optional-label">Optional</span>
                <input
                  type="text"
                  placeholder="e.g. CMP-2026-00482"
                  value={form.complaintId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      complaintId: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                How can we help?
                <textarea
                  rows="4"
                  placeholder="Provide the details we need to understand your request..."
                  value={form.message}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      message: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <p className="contact-privacy">
                Do not include passwords or other sensitive account
                information.
              </p>

              <button
                type="submit"
                className="support-primary-button submit-support"
              >
                <Send size={16} />
                Submit request
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )}
</div>


);
}

export default HelpSupport;
