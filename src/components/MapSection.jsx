import Section from './Section.jsx';
import CorridorMap from './CorridorMap.jsx';
import { useData } from '../data/DataContext.jsx';

export default function MapSection() {
  const { mapPoints, totalMiles } = useData();
  return (
    <Section
      id="map"
      eyebrow="Roads travelled"
      title="Your Northeast corridor"
      sub={`Every toll point you crossed, plotted across ${mapPoints.length} plazas from Baltimore to New York. Glowing lines trace the routes stitched together from consecutive tolls; dashed arcs are point-to-point ticketed trips.`}
    >
      <div className="reveal">
        <CorridorMap />
        <p style={{ color: 'var(--text-faint)', fontSize: 12.5, marginTop: 14, maxWidth: 720 }}>
          Node size reflects how often you passed through. PA Turnpike locations are approximated
          from interchange/milepost numbers, so positions there are schematic. Routes and the{' '}
          {totalMiles.toFixed(0)}-mile estimate use straight-line distance between toll points.
        </p>
      </div>
    </Section>
  );
}
