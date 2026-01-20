import { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Upload() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState(null);

  const supportsText = "supporting docs: pdf, docx, txt, png";

  const token = localStorage.getItem("authToken");

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  const pickFiles = () => fileInputRef.current?.click();

  const onFilesChosen = (fileList) => {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    setFiles((prev) => [...prev, ...arr]);
    setProgress(0);
    setUploading(false);
  };

  const onInputChange = (e) => onFilesChosen(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onFilesChosen(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startUpload = () => {
    if (!files.length) {
      showAlert("Please choose a file first.");
      return;
    }

    if (!folderId) {
      showAlert("Missing folderId in the route.");
      return;
    }

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f)); 

    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/folders/${folderId}/upload`, true);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      setProgress(pct);
    };

    xhr.onload = () => {
      setUploading(false);

      if (xhr.status >= 200 && xhr.status < 300) {
        showAlert("The file uploaded successfully!");
        setFiles([]);
        setProgress(0);
        setTimeout(() => {
          navigate(`/vault/folders/${folderId}`);
        }, 1500);
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText || "{}");
        showAlert(data?.message || "Upload failed");
      } catch {
        showAlert("Upload failed");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      showAlert("Network error");
    };

    xhr.send(fd);
  };

  const uploadingText = useMemo(() => {
    if (!files.length) return "No files selected";
    if (!uploading) return `${files.length} file(s) ready`;
    return `Uploading... ${progress}%`;
  }, [files.length, uploading, progress]);

  return (
    <div style={pageWrap}>
      {alert && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 18px",
          borderRadius: 8,
          background: "#f6a300",
          color: "#111",
          fontWeight: 700,
          zIndex: 10001,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center"
        }}>
          {alert.message}
        </div>
      )}

      <div style={panel}>
        <div style={title}>Upload Your File</div>

        <div style={card}>
          <div style={cardTitle}>UPLOAD</div>

          <div
            style={{
              ...dropZone,
              borderColor: dragOver ? "#f6a300" : "rgba(0,0,0,0.25)",
              background: dragOver ? "rgba(246,163,0,0.08)" : "transparent",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div style={cloud}>☁</div>

            <div style={dropText}>
              drag &amp; drop file or{" "}
              <button type="button" onClick={pickFiles} style={browseBtn}>
                Browse
              </button>
            </div>

            <div style={supportText}>{supportsText}</div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onInputChange}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              disabled={uploading}
            />
          </div>

          {files.length > 0 && (
            <div style={fileList}>
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} style={fileRow}>
                  <span style={fileName}>{truncate(file.name, 28)}</span>
                  <button
                    type="button"
                    style={removeBtn}
                    onClick={() => removeFile(i)}
                    aria-label="Remove file"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div style={uploadingLabel}>{uploadingText}</div>

            <div style={progressTrack}>
              <div style={{ ...progressFill, width: `${progress}%` }} />
            </div>
          </div>

          <button type="button" style={uploadBtn} onClick={startUpload} disabled={uploading}>
            {uploading ? "UPLOADING..." : "UPLOAD FILES"}
          </button>
        </div>

        <button
          type="button"
          style={plusCircle}
          aria-label="Add"
          title="Add file"
          onClick={pickFiles}
          disabled={uploading}
        >
          +
        </button>
      </div>
    </div>
  );
}

function truncate(str, max) {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

const pageWrap = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  paddingTop: 28,
};

const panel = {
  position: "relative",
  width: "100%",
  maxWidth: 1050,
  background: "#0f0f0f",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  border: "1px solid rgba(246,163,0,0.25)",
  minHeight: 520,
};

const title = {
  textAlign: "center",
  color: "#f6a300",
  fontWeight: 900,
  marginBottom: 12,
};

const card = {
  width: 420,
  maxWidth: "100%",
  margin: "0 auto",
  background: "#cfcfcf",
  borderRadius: 10,
  padding: 18,
  textAlign: "center",
  boxShadow: "0 10px 22px rgba(0,0,0,0.25)",
};

const cardTitle = {
  fontWeight: 900,
  fontSize: 13,
  color: "#fff",
  background: "#9a9a9a",
  borderRadius: 8,
  padding: "8px 0",
  marginBottom: 14,
  letterSpacing: 1,
};

const dropZone = {
  border: "1px solid rgba(0,0,0,0.25)",
  borderRadius: 6,
  padding: 16,
  minHeight: 140,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const cloud = {
  fontSize: 34,
  color: "#f6a300",
  marginBottom: 6,
};

const dropText = {
  fontSize: 12,
  color: "#111",
  fontWeight: 800,
};

const browseBtn = {
  border: "none",
  background: "transparent",
  color: "#111",
  fontWeight: 900,
  textDecoration: "underline",
  cursor: "pointer",
  padding: 0,
};

const supportText = {
  marginTop: 6,
  fontSize: 10,
  color: "#333",
};

const fileList = {
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const fileRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#bdbdbd",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 11,
};

const fileName = {
  color: "#111",
  fontWeight: 700,
};

const removeBtn = {
  border: "none",
  background: "transparent",
  color: "#111",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const uploadingLabel = {
  fontSize: 10,
  fontWeight: 800,
  color: "#111",
  marginBottom: 6,
};

const progressTrack = {
  width: "100%",
  height: 6,
  borderRadius: 999,
  background: "#a9a9a9",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background: "#f6a300",
  width: "0%",
};

const uploadBtn = {
  marginTop: 18,
  width: "70%",
  background: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  fontWeight: 900,
  color: "#f6a300",
  cursor: "pointer",
};

const plusCircle = {
  position: "absolute",
  right: 22,
  bottom: 22,
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#f6a300",
  border: "none",
  color: "#fff",
  fontSize: 34,
  fontWeight: 700,
  lineHeight: "64px",
  textAlign: "center",
  boxShadow: "0 12px 22px rgba(0,0,0,0.35)",
  cursor: "pointer",
};