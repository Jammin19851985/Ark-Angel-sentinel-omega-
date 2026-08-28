import { useEffect } from 'react';

/**
 * useTechPanelParallax
 * Global 3D mouse-parallax & tilt-on-scroll engine.
 * - Drives subtle 3D tilt & floating glass elevation on the main application container.
 * - Updates CSS custom properties (--deck-tilt-x, --deck-tilt-y, --deck-float-y, --panel-tilt-x, --panel-tilt-y, --parallax-x, --parallax-y).
 * - Uses spring-damped RAF interpolation for organic floating glass feel during scroll and mouse movement.
 */
export function useTechPanelParallax() {
    useEffect(() => {
        // Skip on mobile / touch-only devices
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        let animationFrameId: number | null = null;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let isLoopRunning = false;

        // Physics state for smooth floating glass momentum
        let targetScrollTiltX = 0;
        let currentScrollTiltX = 0;
        let targetScrollFloatY = 0;
        let currentScrollFloatY = 0;

        let targetMouseTiltX = 0;
        let currentMouseTiltX = 0;
        let targetMouseTiltY = 0;
        let currentMouseTiltY = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;

            const normX = (mouseX - winWidth / 2) / (winWidth / 2);
            const normY = (mouseY - winHeight / 2) / (winHeight / 2);

            // Subtle deck mouse tilt (max ±1.2 degrees)
            targetMouseTiltX = -normY * 1.2;
            targetMouseTiltY = normX * 1.2;

            startAnimationLoop();
        };

        const onWheel = (e: WheelEvent) => {
            // Normalize deltaY
            const delta = Math.max(-100, Math.min(100, e.deltaY));
            
            // Scroll impulse: scrolling down tilts top slightly away (-), scrolling up tilts toward (+)
            const impulseTilt = (delta / 100) * 2.2;
            targetScrollTiltX = Math.max(-3.5, Math.min(3.5, targetScrollTiltX + impulseTilt));

            // Subtle vertical float impulse
            const impulseFloat = -(delta / 100) * 4.0;
            targetScrollFloatY = Math.max(-8, Math.min(8, targetScrollFloatY + impulseFloat));

            startAnimationLoop();
        };

        const onScrollCapture = () => {
            startAnimationLoop();
        };

        const startAnimationLoop = () => {
            if (!isLoopRunning) {
                isLoopRunning = true;
                animationFrameId = requestAnimationFrame(renderPhysicsFrame);
            }
        };

        const renderPhysicsFrame = () => {
            // Lerp dampening factors
            const scrollSpring = 0.12;
            const mouseSpring = 0.08;
            const decay = 0.88;

            // Decay scroll impulse back towards rest (0)
            targetScrollTiltX *= decay;
            targetScrollFloatY *= decay;

            if (Math.abs(targetScrollTiltX) < 0.005) targetScrollTiltX = 0;
            if (Math.abs(targetScrollFloatY) < 0.01) targetScrollFloatY = 0;

            // Smooth interpolation
            currentScrollTiltX += (targetScrollTiltX - currentScrollTiltX) * scrollSpring;
            currentScrollFloatY += (targetScrollFloatY - currentScrollFloatY) * scrollSpring;

            currentMouseTiltX += (targetMouseTiltX - currentMouseTiltX) * mouseSpring;
            currentMouseTiltY += (targetMouseTiltY - currentMouseTiltY) * mouseSpring;

            const totalDeckTiltX = currentMouseTiltX + currentScrollTiltX;
            const totalDeckTiltY = currentMouseTiltY;
            const totalDeckFloatY = currentScrollFloatY;

            // Update main floating glass container
            const deck = document.getElementById('floating-glass-deck') || document.querySelector('.floating-glass-container');
            if (deck) {
                deck.style.setProperty('--deck-tilt-x', `${totalDeckTiltX.toFixed(3)}deg`);
                deck.style.setProperty('--deck-tilt-y', `${totalDeckTiltY.toFixed(3)}deg`);
                deck.style.setProperty('--deck-float-y', `${totalDeckFloatY.toFixed(2)}px`);
            }

            // Update all individual .tech-panel elements
            const panels = document.querySelectorAll<HTMLElement>('.tech-panel');
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;

            panels.forEach((panel) => {
                const rect = panel.getBoundingClientRect();
                
                if (
                    rect.bottom < 0 ||
                    rect.top > winHeight ||
                    rect.right < 0 ||
                    rect.left > winWidth
                ) {
                    return;
                }

                const panelCenterX = rect.left + rect.width / 2;
                const panelCenterY = rect.top + rect.height / 2;

                const distX = (mouseX - panelCenterX) / (winWidth / 2);
                const distY = (mouseY - panelCenterY) / (winHeight / 2);

                const clampX = Math.max(-1, Math.min(1, distX));
                const clampY = Math.max(-1, Math.min(1, distY));

                // 3D Tilt angles (subtle 2.5-3 degrees max, combined with scroll momentum)
                const panelTiltX = -clampY * 2.8 + (currentScrollTiltX * 0.4);
                const panelTiltY = clampX * 2.8;

                const parallaxX = clampX * 8;
                const parallaxY = clampY * 8 - (currentScrollFloatY * 0.5);

                panel.style.setProperty('--panel-tilt-x', `${panelTiltX.toFixed(2)}deg`);
                panel.style.setProperty('--panel-tilt-y', `${panelTiltY.toFixed(2)}deg`);
                panel.style.setProperty('--parallax-x', `${parallaxX.toFixed(2)}px`);
                panel.style.setProperty('--parallax-y', `${parallaxY.toFixed(2)}px`);
            });

            // Continue loop if still moving or settling
            const isSettling =
                Math.abs(currentScrollTiltX) > 0.01 ||
                Math.abs(currentScrollFloatY) > 0.02 ||
                Math.abs(targetMouseTiltX - currentMouseTiltX) > 0.01 ||
                Math.abs(targetMouseTiltY - currentMouseTiltY) > 0.01;

            if (isSettling) {
                animationFrameId = requestAnimationFrame(renderPhysicsFrame);
            } else {
                isLoopRunning = false;
            }
        };

        const onMouseLeave = () => {
            targetMouseTiltX = 0;
            targetMouseTiltY = 0;
            targetScrollTiltX = 0;
            targetScrollFloatY = 0;
            startAnimationLoop();
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('scroll', onScrollCapture, { passive: true, capture: true });
        document.addEventListener('mouseleave', onMouseLeave, { passive: true });

        // Initial trigger
        startAnimationLoop();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('scroll', onScrollCapture, { capture: true } as any);
            document.removeEventListener('mouseleave', onMouseLeave);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);
}

