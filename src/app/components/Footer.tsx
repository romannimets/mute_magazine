const SOCIAL_HANDLE = "@mute_rivista";
const EMAIL_CONTACT = "info.mutemagazine@gmail.com";
const LOCATION      = "Nolo";
const COLLAB_EMAIL  = "info.mutemagazine@gmail.com";
const TAGLINE       = "mute è per tutti e di tutti";
const COPYRIGHT     =
  "All rights reserved to Mute Rivista ® Website designed by Asteriscollettivo. " +
  "Since 2026. All the information spread in this magazine are personal opinions " +
  "and under copyright ® Mute Rivista";

export default function Footer() {
  return (
    <footer id="contatti" className="footer">

      {/* ── BANDA GIALLA ── */}
      <div className="footer__yellow">
        {/* labels + values + newsletter su una riga */}
        <div className="footer__yellow-inner">

          {/* Sinistra: etichette */}
          <div className="footer__labels">
            <span>Seguici su:</span>
            <span>Scrivici a:</span>
            <span>Becchiamoci a:</span>
          </div>

          {/* Centro: valori */}
          <div className="footer__values">
            <span>{SOCIAL_HANDLE}</span>
            <span>{EMAIL_CONTACT}</span>
            <span>{LOCATION}</span>
          </div>

          {/* Destra: link newsletter — allineato in basso */}
          <div className="footer__newsletter">
            <a href="/newsletter" className="footer__newsletter-link">
              Iscriviti alla newsletter →
            </a>
          </div>

        </div>
      </div>

      {/* ── BANDA NERA ── */}
      <div className="footer__black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/LOGO-MU_TE-BIANCO.png" alt="Mute Logo" className="footer__logo" />

        <div className="footer__collab">
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

      {/* ── STRISCIA LEGAL ── */}
      <div className="footer__legal">
        <p>{COPYRIGHT}</p>
      </div>

    </footer>
  );
}