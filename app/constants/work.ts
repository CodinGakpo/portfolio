import * as THREE from 'three';
import { WorkTimelinePoint } from '../types';

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: '2026',
    title: 'Backend Engineering Intern',
    subtitle: 'Aquevix Solutions',
    position: 'right',
  },
  {
    point: new THREE.Vector3(-2, -4, -3),
    year: '2026',
    title: "DevSoc'26 Hackathon Winner",
    subtitle: 'Tech for Good Track · 150+ participants',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-8, -1, -6),
    year: '2026',
    title: "Yantra'26 Central Hack Winner",
    subtitle: 'CS/IT Track',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-2, 3, -5),
    year: '2026',
    title: 'Neo Codeathon Rank 10',
    subtitle: 'Top 10 out of 2000+ participants',
    position: 'right',
  },
  {
    point: new THREE.Vector3(4, 5, -7),
    year: '2023-2026',
    title: 'VIT Vellore - B.Tech Information Security',
    subtitle: 'CGPA 9.11',
    position: 'right',
  },
];
