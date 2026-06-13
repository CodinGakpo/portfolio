import { Scroll, ScrollControls, useScroll } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { usePortalStore } from '@stores';
import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

const Resume = () => {
  const isActive = usePortalStore((state) => state.activePortalId === 'resume');
  const mainData = useScroll();
  const wasActive = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    const originalScrollWrapper = mainData.el;

    if (isActive) {
      wasActive.current = true;
      if (originalScrollWrapper) originalScrollWrapper.style.zIndex = '-1';

      if (isMobile) {
        gsap.to(camera.position, { z: 12, y: -43, x: 1, duration: 1.1, ease: 'power3.inOut' });
      } else {
        gsap.to(camera.position, { z: 12, y: -43, x: 2.2, duration: 1.1, ease: 'power3.inOut' });
      }
    } else if (wasActive.current) {
      wasActive.current = false;
      if (originalScrollWrapper) originalScrollWrapper.style.zIndex = '1';
    }
  }, [isActive, mainData.el, camera.position]);

  return (
    <group>
      <mesh receiveShadow>
        <planeGeometry args={[2.8, 2.8, 1]} />
        <shadowMaterial opacity={0.1} />
      </mesh>

      <ScrollControls style={{ zIndex: -1 }} pages={1} maxSpeed={0}>
        <Scroll
          html
          style={{
            width: '100vw',
            height: '100vh',
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? 'auto' : 'none',
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          <div className="w-full h-full flex items-center justify-center px-4">
            <div className="w-full max-w-5xl h-[80vh] rounded-2xl border border-white/15 bg-black/65 backdrop-blur-md p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm md:text-base tracking-wide">Adidev Anand - Resume</h3>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:text-white"
                >
                  Open PDF
                </a>
              </div>
              <iframe title="Adidev Resume" src="/resume.pdf" className="w-full h-[calc(80vh-64px)] rounded-xl" />
            </div>
          </div>
        </Scroll>
      </ScrollControls>
    </group>
  );
};

export default Resume;
