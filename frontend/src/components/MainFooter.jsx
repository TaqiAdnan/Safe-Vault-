import { Link } from "react-router-dom";

export default function MainFooter() {
  return (
    <footer className="py-4" style={{ background: "#2f2f2f", color: "#d6d6d6" }}>
      <div className="container">
        <div className="row g-4">
          {/* Column 1 */}
          <div className="col-12 col-md-4">
            <h6 className="fw-bold" style={{ color: "#f6a300" }}>LINKS</h6>
            <div className="d-flex flex-column gap-2">
              <Link className="text-decoration-none" style={{ color: "#f6a300" }} to="/contact">
                CONTACT US
              </Link>
              <Link className="text-decoration-none" style={{ color: "#f6a300" }} to="/terms">
                TERMS AND CONDITIONS
              </Link>
              <Link className="text-decoration-none" style={{ color: "#f6a300" }} to="/team">
                OUR TEAM
              </Link>
            </div>
          </div>

          {/* Column 2 */}
          <div className="col-12 col-md-4">
            <h6 className="fw-bold" style={{ color: "#f6a300" }}>ADDRESS</h6>
            <div style={{ color: "#f6a300" }}>
              <div>BIRZEIT UNIVERSITY</div>
              <div>RAMALLAH, PALESTINE</div>
              <div>PO BOX 00102</div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="col-12 col-md-4">
            <h6 className="fw-bold" style={{ color: "#f6a300" }}>SOCIAL MEDIA</h6>
            <div className="d-flex flex-column gap-2">
              <a className="text-decoration-none" style={{ color: "#f6a300" }} href="#">
                LINKED IN
              </a>
              <a className="text-decoration-none" style={{ color: "#f6a300" }} href="#">
                FACEBOOK
              </a>
              <a className="text-decoration-none" style={{ color: "#f6a300" }} href="#">
                INSTAGRAM
              </a>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.15)" }} />

        <div className="d-flex justify-content-end small">
          © 2025 SafeVault. All rights reserved
        </div>
      </div>
    </footer>
  );
}
