import { motion } from 'framer-motion';
import styles from './About.module.css';
import { cardVariants } from '../cards/CardBase.jsx';

export default function About() {
  return (
    <motion.section
      variants={cardVariants}
      className={styles.about}
    >
      <h2 className={styles.heading}>About Five Mile Dam</h2>

      <div className={styles.grid}>
        <div>
          <h3 className={styles.subheading}>What is Five Mile Dam?</h3>
          <p>
            Five Mile Dam is a low-head dam built in <strong>1931</strong> by the State Game, Fish, and Oyster Commission
            (now Texas Parks & Wildlife) on the <strong>Blanco River</strong> in Kyle, TX. Made of native stone, concrete,
            and steel, it impounds a shallow pool that's become a beloved free swimming hole for the Kyle, Buda, and
            San Marcos area.
          </p>
          <p style={{ marginTop: 12 }}>
            The park is officially <strong>Dudley Johnson Park</strong> (Hays County), located at
            4440 S. Old Stagecoach Road, Kyle, TX 78640.
          </p>
        </div>

        <div>
          <h3 className={styles.subheading}>Why check water levels?</h3>
          <p>
            The Blanco is a <strong>"flashy" river</strong> — it swings rapidly between completely dry during drought
            and dangerous flash floods. Making the drive only to find a dry riverbed (or worse, dangerous currents)
            is frustrating and potentially deadly.
          </p>
          <p style={{ marginTop: 12 }}>
            This site checks the <strong>USGS gauge station 08171300</strong> ("Blanco Rv nr Kyle, TX"),
            located approximately 2 miles upstream. Data updates every ~15 minutes via satellite telemetry.
          </p>
        </div>
      </div>

      <div className={styles.links}>
        <a href="https://www.hayscountytx.gov/five-mile-dam-park" target="_blank" rel="noopener noreferrer">
          Hays County Park Info →
        </a>
        <a href="https://waterdata.usgs.gov/monitoring-location/USGS-08171300/" target="_blank" rel="noopener noreferrer">
          USGS Gauge 08171300 →
        </a>
        <a href="https://water.noaa.gov/gauges/08171300" target="_blank" rel="noopener noreferrer">
          NWS Forecast →
        </a>
        <a href="https://www.google.com/maps/search/?api=1&query=29.94333,-97.90139" target="_blank" rel="noopener noreferrer">
          Directions to Five Mile Dam →
        </a>
      </div>

      <div className={styles.safety}>
        <strong>⚠️ Safety Note:</strong> The Blanco River can rise extremely rapidly — a clear sky upstream does
        not mean it's safe downstream. Always check conditions before entering the water and never swim alone.
        In flash flood conditions, move to high ground immediately.
      </div>

      <div className={styles.credits}>
        <strong>Data sources:</strong> USGS Water Services (waterservices.usgs.gov) ·
        NWS National Water Prediction Service (water.noaa.gov) ·
        Open-Meteo (open-meteo.com) ·
        Texas Stream Team / EPA Water Quality Portal (waterqualitydata.us).
        All data is provisional and may be subject to revision. This site is not affiliated with any government agency.
      </div>
    </motion.section>
  );
}
