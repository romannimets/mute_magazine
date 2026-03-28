const SOCIAL_HANDLE = "@mute_rivista";
const EMAIL_CONTACT = "info.mutemagazine@gmail.com";
const LOCATION = "NoLo";
const COLLAB_EMAIL = "info.mutemagazine@gmail.com";
const TAGLINE = "mute è per tutti e di tutti";
const COPYRIGHT =
  "All rights reserved to Mute Rivista ® Website designed by Asteriscollettivo. " +
  "Since 2026. All the information spread in this magazine are personal opinions " +
  "and under copyright ® Mute Rivista";

export default function Footer() {
  return (
    <footer id="contatti" className="footer">

      {/* ── BANDA GIALLA ── */}
      <div className="footer__yellow">
        <div className="footer__container">
          {/* Primo terzo vuoto su desktop/mobile come richiesto */}
          <div className="footer__spacer"></div>

          {/* Due terzi di contenuto */}
          {/* Due terzi di contenuto */}
          <div className="footer__content">
            <div className="footer__vertical-info">

              <div className="footer__info-block">
                <span className="footer__label">Seguici su:</span>
                <span className="footer__value">{SOCIAL_HANDLE}</span>
              </div>

              <div className="footer__info-block">
                <span className="footer__label">Scrivici a:</span>
                <span className="footer__value">{EMAIL_CONTACT}</span>
              </div>

              <div className="footer__info-block">
                <span className="footer__label">Becchiamoci a:</span>
                <span className="footer__value">{LOCATION}</span>
              </div>

              <div className="footer__newsletter">
                <a href="/newsletter" className="footer__newsletter-link">
                  Iscriviti alla newsletter →
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── BANDA NERA ── */}
      <div className="footer__black">
        <div className="footer__container">
          {/* Primo terzo col logo in alto */}
          <div className="footer__logo-col">
            <img src="/LOGO-MU_TE-BIANCO.png" alt="Mute Logo" className="footer__logo" />
          </div>

          {/* Due terzi col testo che parte da metà altezza */}
          <div className="footer__collab-col">
            <div className="footer__collab-content">
              <p className="footer__collab-title">Vuoi collaborare con noi?</p>
              <p className="footer__collab-body">
                Diventa un muter e scrivici a:{" "}
                <a href={`mailto:${COLLAB_EMAIL}`} className="footer__collab-link">
                  {COLLAB_EMAIL}
                </a>
              </p>
              <p className="footer__tagline">{TAGLINE}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STRISCIA LEGAL ── */}
      <div className="footer__legal">
        <p>{COPYRIGHT}</p>
      </div>

    </footer>
  );
}