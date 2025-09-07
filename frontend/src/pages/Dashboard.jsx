import React, { useEffect, useState, useRef, useCallback, use } from "react";
import {
  Upload,
  Download,
  RotateCcw,
  Zap,
  CheckCircle,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [processedUrl, setProcessedUrl] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showBefore, setShowBefore] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let previewUrl;
    if (uploadedFile) {
      previewUrl = URL.createObjectURL(uploadedFile);
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [uploadedFile]);

  useEffect(() => {
    return () => {
      if (processedUrl) {
        URL.revokeObjectURL(processedUrl);
      }
    };
  }, [processedUrl]);

  useEffect(() => {
    if(!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    setProcessedUrl(url);

    return () => URL.revokeObjectURL(url);

  }, [uploadedFile]);


  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);


  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file);
      setIsProcessed(false);

      // Simulate processing
      setIsProcessing(true);

      const formData = new FormData();
      formData.append("file", file);

      axios
        .post("http://localhost:5000/api/process-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          const { image } = response.data;
          if (image) {
            const byteString = atob(image.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "image/jpeg" });
            const blobUrl = URL.createObjectURL(blob);

            setProcessedUrl(blobUrl); // You need to define this state
            setIsProcessing(false);
            setIsProcessed(true);
            setShowBefore(false);
          }
        })
        .catch((err) => {
          console.error(err);
          setIsProcessing(false);
          alert("Failed to process image.");
        });
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setIsProcessed(false);
    setShowBefore(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadResult = () => {
    // Simulate download
    if (!processedUrl) return;
    const link = document.createElement("a");

    link.href = processedUrl;
    link.download = `cleaned_${uploadedFile?.name || "document"}`;
    link.click();
  };

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
      {/* Background Elements */}
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
            top: "10%",
            left: "5%",
            width: "200px",
            height: "200px",
            background: "rgba(168, 85, 247, 0.08)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: "150px",
            height: "150px",
            background: "rgba(59, 130, 246, 0.08)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 4s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 20,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "64px",
          }}
        >
          {/* Logo & Back */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(255, 255, 255, 0.15)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "rgba(255, 255, 255, 0.1)")
              }
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={20} style={{ color: "white" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          </div>

          {/* Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {uploadedFile && (
              <button
                onClick={resetUpload}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                New Upload
              </button>
            )}
            <button
              style={{
                background: "linear-gradient(to right, #9333ea, #ec4899)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Upgrade Pro
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          padding: "32px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {!uploadedFile ? (
            /* Upload Area */
            <div
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "32px" }}>
                <h1
                  style={{
                    fontSize: window.innerWidth >= 768 ? "48px" : "36px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "16px",
                    lineHeight: "1.2",
                  }}
                >
                  Upload Your Document
                </h1>
                <p
                  style={{
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.7)",
                    maxWidth: "600px",
                    margin: "0 auto",
                    lineHeight: "1.6",
                  }}
                >
                  Drag and drop your photo or PDF, or click to browse. Our AI
                  will automatically detect and remove signatures, pen marks,
                  and handwritten text.
                </p>
              </div>

              {/* Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `3px dashed ${
                    dragActive ? "#c084fc" : "rgba(255, 255, 255, 0.3)"
                  }`,
                  borderRadius: "24px",
                  padding: window.innerWidth >= 768 ? "80px 40px" : "60px 20px",
                  background: dragActive
                    ? "rgba(192, 132, 252, 0.1)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))",
                  backdropFilter: "blur(20px)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: dragActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div
                  style={{
                    width: window.innerWidth >= 768 ? "120px" : "80px",
                    height: window.innerWidth >= 768 ? "120px" : "80px",
                    background: "rgba(168, 85, 247, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    transition: "transform 0.3s ease",
                    transform: dragActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <Upload
                    size={window.innerWidth >= 768 ? 48 : 32}
                    style={{ color: "#c084fc" }}
                  />
                </div>
                <h3
                  style={{
                    color: "white",
                    fontSize: window.innerWidth >= 768 ? "24px" : "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {dragActive
                    ? "Drop your file here"
                    : "Choose file or drag it here"}
                </h3>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "16px",
                    marginBottom: "24px",
                  }}
                >
                  Supports JPG, PNG, PDF • Max size 10MB
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  {[
                    "✨ Instant Processing",
                    "🎯 99.9% Accuracy",
                    "🔒 Secure & Private",
                  ].map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.9)",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </div>
          ) : (
            /* Processing/Result Area */
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              {/* Status Header */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: isProcessed
                        ? "#10b981"
                        : isProcessing
                        ? "#9333ea"
                        : "#6b7280",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: isProcessing
                        ? "spin 2s linear infinite"
                        : "none",
                    }}
                  >
                    {isProcessed ? (
                      <CheckCircle size={24} style={{ color: "white" }} />
                    ) : isProcessing ? (
                      <Zap size={24} style={{ color: "white" }} />
                    ) : (
                      <Loader size={24} style={{ color: "white" }} />
                    )}
                  </div>
                  <div>
                    <h2
                      style={{
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "600",
                        margin: 0,
                      }}
                    >
                      {isProcessed
                        ? "Processing Complete!"
                        : isProcessing
                        ? "Processing..."
                        : "Ready to Process"}
                    </h2>
                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      {uploadedFile?.name} •{" "}
                      {(uploadedFile?.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                </div>

                {isProcessed && (
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={downloadResult}
                      style={{
                        background:
                          "linear-gradient(to right, #9333ea, #ec4899)",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={resetUpload}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <RotateCcw size={16} />
                      New Upload
                    </button>
                  </div>
                )}
              </div>

              {/* Before/After Comparison */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "24px",
                  padding: window.innerWidth >= 768 ? "32px" : "20px",
                  marginBottom: "32px",
                }}
              >
                {/* Toggle Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <h3
                    style={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    {isProcessed ? "Before vs After" : "Preview"}
                  </h3>

                  {isProcessed && (
                    <div
                      style={{
                        display: "flex",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50px",
                        padding: "4px",
                      }}
                    >
                      <button
                        onClick={() => setShowBefore(true)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "50px",
                          background: showBefore ? "#9333ea" : "transparent",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye size={16} />
                        Before
                      </button>
                      <button
                        onClick={() => setShowBefore(false)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "50px",
                          background: !showBefore ? "#9333ea" : "transparent",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <EyeOff size={16} />
                        After
                      </button>
                    </div>
                  )}
                </div>

                {/* Image Display Area */}
                <div
                  style={{
                    aspectRatio: "16/10",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))",
                    borderRadius: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {uploadedFile?.type.startsWith("image/") ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: `url(${showBefore ? URL.createObjectURL(uploadedFile) : processedUrl})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        position: "relative",
                      }}
                    >
                      {isProcessed && !showBefore && (
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            background: "rgba(16, 185, 129, 0.9)",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <CheckCircle size={14} />
                          Signatures Removed
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "rgba(168, 85, 247, 0.2)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                        }}
                      >
                        <Upload size={40} style={{ color: "#c084fc" }} />
                      </div>
                      <h4
                        style={{
                          color: "white",
                          fontSize: "18px",
                          fontWeight: "600",
                          margin: "0 0 8px 0",
                        }}
                      >
                        PDF Preview
                      </h4>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        {uploadedFile?.name}
                      </p>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          background: "#9333ea",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          animation: "spin 2s linear infinite",
                        }}
                      >
                        <Zap size={30} style={{ color: "white" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <h4
                          style={{
                            color: "white",
                            fontSize: "20px",
                            fontWeight: "600",
                            margin: "0 0 8px 0",
                          }}
                        >
                          AI Processing...
                        </h4>
                        <p
                          style={{
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "14px",
                            margin: 0,
                          }}
                        >
                          Detecting and removing signatures
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Process Steps */}
                {(isProcessing || isProcessed) && (
                  <div
                    style={{
                      marginTop: "24px",
                      display: "grid",
                      gridTemplateColumns:
                        window.innerWidth >= 768 ? "repeat(3, 1fr)" : "1fr",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <CheckCircle size={20} style={{ color: "#10b981" }} />
                      <span
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        File Uploaded
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background:
                          isProcessing || isProcessed
                            ? "rgba(147, 51, 234, 0.1)"
                            : "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${
                          isProcessing || isProcessed
                            ? "rgba(147, 51, 234, 0.3)"
                            : "rgba(255, 255, 255, 0.1)"
                        }`,
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          animation: isProcessing
                            ? "spin 2s linear infinite"
                            : "none",
                        }}
                      >
                        <Zap
                          size={20}
                          style={{
                            color:
                              isProcessing || isProcessed
                                ? "#9333ea"
                                : "#6b7280",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          color:
                            isProcessing || isProcessed
                              ? "white"
                              : "rgba(255, 255, 255, 0.5)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        AI Processing
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: isProcessed
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${
                          isProcessed
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(255, 255, 255, 0.1)"
                        }`,
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <CheckCircle
                        size={20}
                        style={{ color: isProcessed ? "#10b981" : "#6b7280" }}
                      />
                      <span
                        style={{
                          color: isProcessed
                            ? "white"
                            : "rgba(255, 255, 255, 0.5)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Ready to Download
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

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

export default Dashboard;
