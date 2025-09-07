import React, { useState, useEffect } from "react";
import {
  Upload,
  Zap,
  FileText,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Features", "How it Works", "Contact"];

  const features = [
    { icon: <Zap size={16} />, text: "Instant Processing" },
    { icon: <FileText size={16} />, text: "PDF & Image Support" },
    { icon: <CheckCircle size={16} />, text: "99.9% Accuracy" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "200px",
            height: "200px",
            background: "rgba(168, 85, 247, 0.1)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 3s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "150px",
            height: "150px",
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 3s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background:
            scrollY > 50 ? "rgba(255, 255, 255, 0.05)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
          borderBottom:
            scrollY > 50 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "64px",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(to right, #a855f7, #ec4899)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  I
                </span>
              </div>
              <span
                style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}
              >
                InkAway
              </span>
            </div>

            {/* Desktop Menu */}
            <div
              style={{
                display: window.innerWidth >= 768 ? "flex" : "none",
                alignItems: "center",
                gap: "40px",
              }}
            >
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: "500",
                    fontSize: "14px",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "white")}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "rgba(255, 255, 255, 0.7)")
                  }
                >
                  {item}
                </a>
              ))}
              <button
                style={{
                  background: "linear-gradient(to right, #9333ea, #ec4899)",
                  color: "white",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  fontWeight: "500",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow =
                    "0 10px 25px rgba(168, 85, 247, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
                onClick={() => navigate("/dashboard")}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: window.innerWidth < 768 ? "block" : "none",
                color: "white",
                padding: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "16px 0",
              }}
            >
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  style={{
                    display: "block",
                    color: "rgba(255, 255, 255, 0.7)",
                    padding: "12px 16px",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item}
                </a>
              ))}
              <div style={{ padding: "8px 16px 0" }}>
                <button
                  style={{
                    width: "100%",
                    background: "linear-gradient(to right, #9333ea, #ec4899)",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "50px",
                    fontWeight: "500",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: "96px",
          paddingBottom: "64px",
          padding: "96px 16px 64px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                window.innerWidth >= 1024 ? "1fr 1fr" : "1fr",
              gap: window.innerWidth >= 1024 ? "64px" : "48px",
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div
              style={{
                textAlign: window.innerWidth >= 1024 ? "left" : "center",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50px",
                  padding: "8px 16px",
                  alignSelf:
                    window.innerWidth >= 1024 ? "flex-start" : "center",
                }}
              >
                <Zap size={16} style={{ color: "#fbbf24" }} />
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  AI-Powered Technology
                </span>
              </div>

              {/* Main Heading */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h1
                  style={{
                    fontSize:
                      window.innerWidth >= 1024
                        ? "4rem"
                        : window.innerWidth >= 640
                        ? "3rem"
                        : "2.5rem",
                    fontWeight: "bold",
                    color: "white",
                    lineHeight: "1.1",
                    margin: 0,
                  }}
                >
                  Remove{" "}
                  <span
                    style={{
                      background: "linear-gradient(to right, #c084fc, #f472b6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      display: "block",
                    }}
                  >
                    Signatures
                  </span>
                  Instantly
                </h1>
                <p
                  style={{
                    fontSize: window.innerWidth >= 1024 ? "20px" : "18px",
                    color: "rgba(255, 255, 255, 0.7)",
                    lineHeight: "1.6",
                    maxWidth: "600px",
                    margin: window.innerWidth >= 1024 ? "0" : "0 auto",
                  }}
                >
                  Upload any photo or PDF with unwanted signatures, pen marks,
                  or handwritten text. Our AI removes them in seconds with
                  pixel-perfect precision.
                </p>
              </div>

              {/* Feature Pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  justifyContent:
                    window.innerWidth >= 1024 ? "flex-start" : "center",
                }}
              >
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "50px",
                      padding: "8px 16px",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span style={{ color: "#c084fc" }}>{feature.icon}</span>
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth >= 640 ? "row" : "column",
                  gap: "16px",
                  justifyContent:
                    window.innerWidth >= 1024 ? "flex-start" : "center",
                }}
              >
                <button
                  style={{
                    background: "linear-gradient(to right, #9333ea, #ec4899)",
                    color: "white",
                    padding: "16px 32px",
                    borderRadius: "50px",
                    fontWeight: "600",
                    fontSize: "18px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    minWidth: "200px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.boxShadow =
                      "0 20px 40px rgba(147, 51, 234, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "none";
                  }}
                  onClick={() => navigate("/dashboard")}
                >
                  <Upload size={20} />
                  <span>Upload & Clean</span>
                  <ArrowRight size={20} />
                </button>
                <button
                  style={{
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    background: "transparent",
                    color: "white",
                    padding: "16px 32px",
                    borderRadius: "50px",
                    fontWeight: "600",
                    fontSize: "18px",
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    minWidth: "160px",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(255, 255, 255, 0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "transparent")
                  }
                >
                  Watch Demo
                </button>
              </div>

              {/* Social Proof */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                  maxWidth: "400px",
                  margin: window.innerWidth >= 1024 ? "0" : "0 auto",
                  paddingTop: "16px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    50K+
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "12px",
                    }}
                  >
                    Documents
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    99.9%
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "12px",
                    }}
                  >
                    Accuracy
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    2s
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "12px",
                    }}
                  >
                    Processing
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Demo Area */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "500px",
                margin: window.innerWidth >= 1024 ? "0" : "0 auto",
                marginTop: window.innerWidth >= 1024 ? "0" : "32px",
              }}
            >
              {/* Main Demo Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "24px",
                  padding: window.innerWidth >= 768 ? "32px" : "24px",
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <h3
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: "18px",
                      margin: 0,
                    }}
                  >
                    Live Demo
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "50px",
                      padding: "4px",
                    }}
                  >
                    <button
                      style={{
                        padding: "8px 16px",
                        borderRadius: "50px",
                        background: "#9333ea",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Before
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        borderRadius: "50px",
                        background: "transparent",
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      After
                    </button>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  style={{
                    aspectRatio: "4/3",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))",
                    borderRadius: "16px",
                    border: "2px dashed rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px",
                    marginBottom: "24px",
                    cursor: "pointer",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "rgba(168, 85, 247, 0.2)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Upload size={32} style={{ color: "#c084fc" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        color: "white",
                        fontWeight: "500",
                        fontSize: "16px",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Drop your file here
                    </p>
                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>

                {/* Process Steps */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#10b981",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle size={20} style={{ color: "white" }} />
                    </div>
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "15px",
                      }}
                    >
                      File uploaded successfully
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#9333ea",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        animation: "spin 2s linear infinite",
                      }}
                    >
                      <Zap size={20} style={{ color: "white" }} />
                    </div>
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "15px",
                      }}
                    >
                      AI processing signatures...
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      opacity: 0.5,
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle
                        size={20}
                        style={{ color: "rgba(255, 255, 255, 0.5)" }}
                      />
                    </div>
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "15px",
                      }}
                    >
                      Clean document ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div
                style={{
                  position: "absolute",
                  top: "-16px",
                  right: "-16px",
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(to right, #a855f7, #ec4899)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                  opacity: 0.4,
                  animation: "pulse 3s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-16px",
                  left: "-16px",
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(to right, #3b82f6, #a855f7)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                  opacity: 0.4,
                  animation: "pulse 3s ease-in-out infinite",
                  animationDelay: "1s",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Trusted By Section */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          padding: "48px 16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "16px",
              marginBottom: "32px",
            }}
          >
            Trusted by professionals worldwide
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: window.innerWidth >= 768 ? "48px" : "24px",
              opacity: 0.6,
            }}
          >
            {["CORP", "TECH", "LAW", "BANK"].map((company, index) => (
              <div
                key={index}
                style={{
                  width: window.innerWidth >= 768 ? "96px" : "60px",
                  height: window.innerWidth >= 768 ? "32px" : "24px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: window.innerWidth >= 768 ? "12px" : "10px",
                  }}
                >
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 40,
        }}
      >
        <button
          style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(to right, #9333ea, #ec4899)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 20px 40px rgba(147, 51, 234, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
          }}
        >
          <Upload size={24} style={{ color: "white" }} />
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Homepage;
