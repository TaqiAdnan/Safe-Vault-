function formatBytes(bytes) {
    const b = Number(bytes || 0);
    if (!Number.isFinite(b) || b <= 0) return "0 KB";
    const kb = b / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  }
  
  module.exports = { formatBytes };
  