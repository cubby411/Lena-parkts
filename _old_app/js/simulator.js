class Car {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        
        this.width = 40;
        this.length = 80;
        this.wheelbase = 50;
        
        this.steeringAngle = 0;
        this.speed = 0;
    }

    setSteering(degrees) {
        const clamped = Math.max(-45, Math.min(45, degrees));
        this.steeringAngle = clamped * (Math.PI / 180);
    }

    update(dt) {
        if (this.speed === 0) return;
        const distance = this.speed * dt;
        const turnAngle = (distance / this.wheelbase) * Math.tan(this.steeringAngle);
        this.angle += turnAngle;
        this.x += distance * Math.cos(this.angle);
        this.y += distance * Math.sin(this.angle);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const wheelLen = 14;
        const wheelWid = 6;
        const axleFront = this.wheelbase;
        const axleRear  = 0;

        // ── 1. Wheels (draw underneath) ──
        ctx.fillStyle = '#111';
        
        ctx.save();
        ctx.translate(axleFront, -this.width/2 + 2);
        ctx.rotate(this.steeringAngle);
        ctx.fillRect(-wheelLen/2, -wheelWid/2, wheelLen, wheelWid);
        ctx.restore();

        ctx.save();
        ctx.translate(axleFront, this.width/2 - 2);
        ctx.rotate(this.steeringAngle);
        ctx.fillRect(-wheelLen/2, -wheelWid/2, wheelLen, wheelWid);
        ctx.restore();

        ctx.fillRect(axleRear - wheelLen/2, -this.width/2 + 2 - wheelWid/2, wheelLen, wheelWid);
        ctx.fillRect(axleRear - wheelLen/2,  this.width/2 - 2 - wheelWid/2, wheelLen, wheelWid);

        // ── 2. Main Body Silhouette ──
        const bodyGradient = ctx.createRadialGradient(25, 0, 5, 25, 0, 45);
        bodyGradient.addColorStop(0, '#e5e7eb');   
        bodyGradient.addColorStop(0.7, '#d1d5db'); 
        bodyGradient.addColorStop(1, '#9ca3af');   

        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.moveTo(62, -10); // Nose right
        ctx.bezierCurveTo(62, -17, 56, -19.5, 45, -19.5); // Front right wheel arch
        ctx.bezierCurveTo(30, -19.5, 25, -17.5, 10, -17.5); // Waist right
        ctx.bezierCurveTo(-5, -17.5, -5, -19, -10, -18); // Rear right arch
        ctx.bezierCurveTo(-15, -17, -16, -10, -16, 0); // Rear right to rear center
        ctx.bezierCurveTo(-16, 10, -15, 17, -10, 18); // Rear center to rear left arch
        ctx.bezierCurveTo(-5, 19, -5, 17.5, 10, 17.5); // Rear left arch to waist
        ctx.bezierCurveTo(25, 17.5, 30, 19.5, 45, 19.5); // Waist to front left arch
        ctx.bezierCurveTo(56, 19.5, 62, 17, 62, 10); // Front left arch to nose left
        ctx.bezierCurveTo(65, 5, 65, -5, 62, -10); // Nose curve
        ctx.fill();

        // ── 3. Side Skirts / Aero Trim ──
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(38, -19); ctx.bezierCurveTo(25, -19, 15, -17.5, 2, -18);
        ctx.lineTo(2, -17); ctx.bezierCurveTo(15, -16.5, 25, -18, 38, -18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(38, 19); ctx.bezierCurveTo(25, 19, 15, 17.5, 2, 18);
        ctx.lineTo(2, 17); ctx.bezierCurveTo(15, 16.5, 25, 18, 38, 18);
        ctx.fill();

        // ── 4. Black front aero & grille ──
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(64, -7);
        ctx.bezierCurveTo(61, -7, 60, -4, 60, 0);
        ctx.bezierCurveTo(60, 4, 61, 7, 64, 7);
        ctx.bezierCurveTo(64.5, 4, 64.5, -4, 64, -7);
        ctx.fill();

        // ── 5. Glass Canopy (Teardrop shape) ──
        const glassGrad = ctx.createLinearGradient(-15, 0, 50, 0);
        glassGrad.addColorStop(0, '#020408'); 
        glassGrad.addColorStop(0.5, '#0a0f1a'); 
        glassGrad.addColorStop(1, '#1b2333'); 

        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.moveTo(48, -12); // Front of windshield
        ctx.bezierCurveTo(48, -15, 38, -16, 25, -14); // Windshield to side window
        ctx.bezierCurveTo(10, -12, 0, -11, -8, -10); // Side window to rear window
        ctx.bezierCurveTo(-12, -7, -12, 7, -8, 10); // Rear window base
        ctx.bezierCurveTo(0, 11, 10, 12, 25, 14); // Left rear window to side
        ctx.bezierCurveTo(38, 16, 48, 15, 48, 12); // Left side to windshield front
        ctx.bezierCurveTo(51, 6, 51, -6, 48, -12); // Windshield front curve
        ctx.fill();

        // Glass highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(48, -10); ctx.bezierCurveTo(30, -10, 10, -5, -8, -5); ctx.lineTo(-8, -10);
        ctx.bezierCurveTo(0, -11, 10, -12, 25, -14); ctx.bezierCurveTo(38, -16, 48, -15, 48, -12);
        ctx.fill();

        // ── Spoiler lip ──
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(-4, -8);
        ctx.bezierCurveTo(-8, -4, -8, 4, -4, 8);
        ctx.bezierCurveTo(-5, 4, -5, -4, -4, -8);
        ctx.fill();

        // ── 6. Hood Creases ──
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(50, -10); ctx.lineTo(60, -4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, 10); ctx.lineTo(60, 4); ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath(); ctx.moveTo(50, -9); ctx.lineTo(59, -3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, 11); ctx.lineTo(59, 5); ctx.stroke();

        // ── 7. Cupra Logo (Copper Triangle on hood) ──
        ctx.fillStyle = '#c27b53';
        ctx.shadowColor = '#c27b53';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(58, 0);
        ctx.lineTo(54, -3.5);
        ctx.lineTo(54, 3.5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ── 8. Headlights ──
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.moveTo(61, -10); ctx.lineTo(60, -17); ctx.lineTo(52, -18); ctx.fill();
        ctx.beginPath(); ctx.moveTo(61, 10); ctx.lineTo(60, 17); ctx.lineTo(52, 18); ctx.fill();

        ctx.fillStyle = '#e0f2fe';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(60.5, -11); ctx.lineTo(59.5, -16); ctx.lineTo(54, -17); ctx.fill();
        ctx.beginPath(); ctx.moveTo(60.5, 11); ctx.lineTo(59.5, 16); ctx.lineTo(54, 17); ctx.fill();
        ctx.shadowBlur = 0;

        // ── 9. Taillights (Curved Coast-to-Coast LED) ──
        ctx.strokeStyle = '#dc2626';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, -14);
        ctx.bezierCurveTo(-15, -8, -15, 8, -12, 14);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ── 10. Side Mirrors ──
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.moveTo(38, -17.5); ctx.lineTo(32, -23); ctx.lineTo(34, -17.5); ctx.fill();
        ctx.beginPath(); ctx.moveTo(38, 17.5); ctx.lineTo(32, 23); ctx.lineTo(34, 17.5); ctx.fill();

        ctx.restore();
    }
}

function drawStaticCar(ctx, x, y, width, length, color, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-length/2, -width/2, length, width, 5);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(-length/4, -width/2 + 2, length/2, width - 4, 4);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.roundRect(length/4 - 10, -width/2 + 3, 10, width - 6, 2); 
    ctx.roundRect(-length/4, -width/2 + 4, 6, width - 8, 2); 
    ctx.fill();
    
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(length/2 - 5, -width/2 + 2, 5, 8, 2);
    ctx.roundRect(length/2 - 5, width/2 - 10, 5, 8, 2);
    ctx.fill();
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-length/2, -width/2 + 2, 4, 8, 2);
    ctx.roundRect(-length/2, width/2 - 10, 4, 8, 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(length/4 - 15, -width/2 - 3, 6, 4, 2); 
    ctx.roundRect(length/4 - 15, width/2 - 1, 6, 4, 2); 
    ctx.fill();

    ctx.restore();
}

// ---- Collision Detection Helpers (SAT) ----
function checkCollisionOBB(obb1, obb2) {
    const polys = [obb1, obb2];
    for (let i = 0; i < polys.length; i++) {
        const poly = polys[i];
        for (let j = 0; j < poly.length; j++) {
            const p1 = poly[j];
            const p2 = poly[(j + 1) % poly.length];
            const normal = { x: p2.y - p1.y, y: p1.x - p2.x };
            
            let minA = Infinity, maxA = -Infinity;
            for (const p of obb1) {
                const proj = (p.x * normal.x + p.y * normal.y);
                minA = Math.min(minA, proj);
                maxA = Math.max(maxA, proj);
            }
            
            let minB = Infinity, maxB = -Infinity;
            for (const p of obb2) {
                const proj = (p.x * normal.x + p.y * normal.y);
                minB = Math.min(minB, proj);
                maxB = Math.max(maxB, proj);
            }
            
            if (maxA < minB || maxB < minA) return false;
        }
    }
    return true;
}

// ---- StVO Turning Assistant ----
function evaluateTurningSpot(carPosition, roadWidth, hasSolidLine, oncomingTrafficDist) {
    const CAR_LENGTH = 80;
    const MIN_TURN_DIAMETER = 350; 

    // Layer A Constraints
    if (hasSolidLine) {
        return { isLegal: false, maneuverType: 'None', feedback: "Illegal maneuver: Crossing a solid white line is a traffic violation." };
    }
    
    // Layer B Constraints
    if (oncomingTrafficDist !== null && oncomingTrafficDist < 50) {
        return { isLegal: true, maneuverType: 'Wait', feedback: "Caution: Oncoming traffic detected. Wait for a larger gap." };
    }
    
    // Layer C Constraints
    if (roadWidth > MIN_TURN_DIAMETER) {
        return { isLegal: true, maneuverType: 'U-turn', feedback: "Optimal turning spot found. No solid lines, clear visibility." };
    } else if (roadWidth > CAR_LENGTH) {
        return { isLegal: true, maneuverType: '3-point turn', feedback: "Road too narrow for a U-turn. Please initiate a three-point turn (Forward-Reverse-Forward)." };
    } else {
        return { isLegal: false, maneuverType: 'None', feedback: "Road too narrow to turn." };
    }
}

function getCarOBB(car) {
    const corners = [{x: 65, y: -20}, {x: 65, y: 20}, {x: -15, y: 20}, {x: -15, y: -20}];
    const cosA = Math.cos(car.angle), sinA = Math.sin(car.angle);
    return corners.map(c => ({
        x: car.x + c.x * cosA - c.y * sinA,
        y: car.y + c.x * sinA + c.y * cosA
    }));
}

function getStaticCarOBB(cx, cy, width, length, angle) {
    const hw = width / 2, hl = length / 2;
    const corners = [{x: hl, y: -hw}, {x: hl, y: hw}, {x: -hl, y: hw}, {x: -hl, y: -hw}];
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    return corners.map(c => ({
        x: cx + c.x * cosA - c.y * sinA,
        y: cy + c.x * sinA + c.y * cosA
    }));
}

function getRectOBB(x, y, w, h) {
    return [
        {x: x, y: y}, {x: x+w, y: y}, {x: x+w, y: y+h}, {x: x, y: y+h}
    ];
}

function drawEnvironment(ctx, scenario, width, height) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    if (scenario === 'parallel') {
        // Road background and lines
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 0, width, height);
        
        // Center dashed line
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(width, 150);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Solid white right curb line
        ctx.beginPath();
        ctx.moveTo(0, 280);
        ctx.lineTo(width, 280);
        ctx.stroke();
        
        // Sidewalk
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 360, width, 40);
        
        // Grass
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 400, width, height - 400);
        
        // Parked cars (on the right side)
        drawStaticCar(ctx, 150, 320, 42, 85, '#ef4444', 0); // Rear red car
        drawStaticCar(ctx, 480, 320, 42, 85, '#64748b', 0); // Front gray car
        
        // Target spot highlight
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(220, 290, 210, 60);
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.fillRect(220, 290, 210, 60);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ziel', 325, 325);
    }
    else if (scenario === 'perpendicular') {
        // Center dashed line
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(width, 150);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Right curb / edge of spots
        ctx.beginPath();
        ctx.moveTo(0, 250);
        ctx.lineTo(width, 250);
        ctx.stroke();
        
        // Perpendicular spots lines
        ctx.beginPath();
        for (let x = 150; x <= 650; x += 100) {
            ctx.moveTo(x, 250);
            ctx.lineTo(x, 430);
        }
        ctx.stroke();
        
        // Sidewalk & Grass
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 430, width, 40);
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 470, width, height - 470);
        
        // Static parked cars
        drawStaticCar(ctx, 200, 340, 42, 85, '#eab308', -Math.PI/2); // Left yellow car
        drawStaticCar(ctx, 400, 340, 42, 85, '#ef4444', -Math.PI/2); // Right red car
        
        // Target spot
        ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
        ctx.fillRect(250, 250, 100, 180);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.strokeRect(251, 251, 98, 178);
        
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ziel', 300, 340);
    }
    else if (scenario === 'turn') {
        // Narrow road limits
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(width, 150);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(width, 400);
        ctx.stroke();
        
        // Grass top/bottom
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 0, width, 150);
        ctx.fillRect(0, 400, width, height - 400);
        
        // Target Spot (Left-facing in left lane)
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(100, 200, 150, 60);
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.fillRect(100, 200, 150, 60);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ziel', 175, 235);
    }
}

class Simulator {
    constructor() {
        this.canvas = document.getElementById('sim-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.slider = document.getElementById('steering-slider');
        this.sliderValue = document.getElementById('steering-value');
        this.btnFwd = document.getElementById('btn-drive-fwd');
        this.btnRev = document.getElementById('btn-drive-rev');
        this.scenarioSelect = document.getElementById('scenario-select');
        
        this.scenario = this.scenarioSelect ? this.scenarioSelect.value : 'parallel';

        this.car = new Car(0, 0, 0);
        this.lastTime = performance.now();
        this.drivingFrames = 0;
        this.targetSpeed = 0;
        this.crashTimer = 0;
        this.won = false;

        this.bindEvents();
        
        this.btnRestart = document.getElementById('btn-win-restart');
        if (this.btnRestart) {
            this.btnRestart.addEventListener('click', () => {
                this.reset();
            });
        }
        
        this.reset();
        this.loop(performance.now());
    }

    checkCollisions() {
        const myOBB = getCarOBB(this.car);
        const obstacles = [];
        
        // Canvas bounds
        obstacles.push(getRectOBB(-100, -100, this.canvas.width + 200, 100)); // Top
        obstacles.push(getRectOBB(-100, -100, 100, this.canvas.height + 200)); // Left
        obstacles.push(getRectOBB(this.canvas.width, -100, 100, this.canvas.height + 200)); // Right
        obstacles.push(getRectOBB(-100, this.canvas.height, this.canvas.width + 200, 100)); // Bottom
        
        if (this.scenario === 'parallel') {
            obstacles.push(getRectOBB(0, 360, this.canvas.width, this.canvas.height - 360)); // Sidewalk
            obstacles.push(getStaticCarOBB(150, 320, 42, 85, 0)); // Rear parked car
            obstacles.push(getStaticCarOBB(480, 320, 42, 85, 0)); // Front parked car
        } else if (this.scenario === 'perpendicular') {
            obstacles.push(getRectOBB(0, 430, this.canvas.width, this.canvas.height - 430)); // Sidewalk
            obstacles.push(getRectOBB(0, 250, 250, 180)); // Left curb spaces
            obstacles.push(getRectOBB(350, 250, this.canvas.width - 350, 180)); // Right curb spaces
            obstacles.push(getStaticCarOBB(200, 340, 42, 85, -Math.PI/2)); // Left parked car
            obstacles.push(getStaticCarOBB(400, 340, 42, 85, -Math.PI/2)); // Right parked car
        } else if (this.scenario === 'turn') {
            obstacles.push(getRectOBB(0, 0, this.canvas.width, 150)); // Top Grass
            obstacles.push(getRectOBB(0, 400, this.canvas.width, this.canvas.height - 400)); // Bottom Grass
        }

        for (const obs of obstacles) {
            if (checkCollisionOBB(myOBB, obs)) {
                return true;
            }
        }
        return false;
    }

    checkWinCondition() {
        if (this.won) return;
        const myOBB = getCarOBB(this.car);
        let targetRect = null;
        let expectedAngle = 0;
        
        if (this.scenario === 'parallel') {
            targetRect = { x: 220, y: 290, w: 210, h: 60 };
            expectedAngle = 0;
        } else if (this.scenario === 'perpendicular') {
            targetRect = { x: 251, y: 251, w: 98, h: 178 };
            expectedAngle = -Math.PI / 2;
        } else if (this.scenario === 'turn') {
            targetRect = { x: 100, y: 200, w: 150, h: 60 };
            expectedAngle = Math.PI;
        }

        // Normalize angle difference to [0, PI]
        let diff = Math.abs((this.car.angle % (2 * Math.PI)) - expectedAngle);
        while (diff > Math.PI) diff = 2 * Math.PI - diff;
        
        // Tolerance: +/- 10 degrees is acceptable straightness
        if (diff > 10 * Math.PI / 180) return;

        // Check if all of the car's bounding box points are strictly inside the target rect
        for (const p of myOBB) {
            if (p.x < targetRect.x || p.x > targetRect.x + targetRect.w ||
                p.y < targetRect.y || p.y > targetRect.y + targetRect.h) {
                return;
            }
        }

        // Win state achieved!
        this.won = true;
        const overlay = document.getElementById('win-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    updateAssistantUI(result) {
        const assistantUI = document.getElementById('stvo-assistant');
        const feedbackEl = document.getElementById('stvo-feedback');
        if (!assistantUI || !feedbackEl) return;
        
        assistantUI.style.display = 'block';
        
        let color = result.isLegal ? '#22c55e' : '#ef4444';
        if (result.maneuverType === 'Wait') color = '#eab308';
        
        feedbackEl.innerHTML = `
            <span style="color: ${color}; font-weight: bold; text-transform: uppercase;">Status: ${result.isLegal ? 'Legal' : 'Illegal'} / ${result.maneuverType}</span><br>
            <span style="font-size: 0.95rem; opacity: 0.9; margin-top: 5px; display: block;">${result.feedback}</span>
        `;
    }

    reset() {
        this.car.speed = 0;
        this.car.setSteering(0);
        this.drivingFrames = 0;
        this.slider.value = 0;
        this.sliderValue.textContent = '0°';
        this.won = false;
        
        const overlay = document.getElementById('win-overlay');
        if (overlay) overlay.style.display = 'none';
        
        const stvoUI = document.getElementById('stvo-assistant');
        if (stvoUI) stvoUI.style.display = 'none';
        
        if (this.scenario === 'parallel') {
            this.car.x = 200; // Approaching from left
            this.car.y = 220; // Driving in right lane
            this.car.angle = 0;
        } else if (this.scenario === 'perpendicular') {
            this.car.x = 100;
            this.car.y = 200; // Driving lane
            this.car.angle = 0;
        } else if (this.scenario === 'turn') {
            this.car.x = 600; // right side
            this.car.y = 360; // pulled over 
            this.car.angle = 0;
        }
    }

    bindEvents() {
        if (this.scenarioSelect) {
            this.scenarioSelect.addEventListener('change', (e) => {
                this.scenario = e.target.value;
                this.reset();
            });
        }

        this.slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.sliderValue.textContent = val + '°';
            this.car.setSteering(val);
        });

        const driveAction = (direction) => {
            if (this.drivingFrames > 0) return;
            this.targetSpeed = direction * 100;
            this.drivingFrames = 30;
        };

        this.btnFwd.addEventListener('mousedown', () => driveAction(1));
        this.btnRev.addEventListener('mousedown', () => driveAction(-1));
        
        this.btnFwd.addEventListener('touchstart', (e) => { e.preventDefault(); driveAction(1); });
        this.btnRev.addEventListener('touchstart', (e) => { e.preventDefault(); driveAction(-1); });
    }

    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.drivingFrames > 0) {
            this.car.speed = this.targetSpeed;
            this.drivingFrames--;
        } else {
            this.car.speed = 0;
        }

        const oldX = this.car.x;
        const oldY = this.car.y;
        const oldAngle = this.car.angle;

        this.car.update(dt);
        
        if (this.car.speed !== 0 && this.checkCollisions()) {
            this.car.x = oldX;
            this.car.y = oldY;
            this.car.angle = oldAngle;
            this.car.speed = 0;
            this.drivingFrames = 0;
            this.crashTimer = 30; // 30 frames of crash feedback
        }
        
        // Evaluate Win Condition if car is fully stopped
        if (this.car.speed === 0 && this.drivingFrames === 0 && !this.won && this.crashTimer === 0) {
            this.checkWinCondition();
        }

        // Run StVO Assistant during turning scenario dynamically
        if (this.scenario === 'turn') {
            const roadWidth = 250; // Distance between curbs
            const hasSolidLine = false; // Add solid line hit box optionally
            const trafficDist = null; // No moving traffic implemented yet
            const evalResult = evaluateTurningSpot(this.car, roadWidth, hasSolidLine, trafficDist);
            this.updateAssistantUI(evalResult);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawEnvironment(this.ctx, this.scenario, this.canvas.width, this.canvas.height);
        this.car.draw(this.ctx);

        if (this.crashTimer > 0) {
            this.ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.crashTimer--;
            
            this.ctx.fillStyle = '#ef4444';
            this.ctx.font = 'bold 48px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CRASH!', this.canvas.width / 2, this.canvas.height / 2);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

class TutorialRenderer {
    constructor() {
        this.canvas = document.getElementById('tutorial-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.scenario = 'parallel';
        this.stepIndex = 0;
        this.car = new Car(0, 0, 0);

        this.animating = false;
        this.lastTime = 0;

        // Definition of starting positions before any maneuvers
        this.startPoses = {
            parallel: { x: 50, y: 230, a: 0 },
            perpendicular: { x: -50, y: 190, a: 0 },
            turn: { x: 700, y: 360, a: 0 }
        };

        // Maneuvers are instructions: steer (degrees), speed (px/s), duration (ms)
        this.parallelManeuvers = [
            { steer: 0, speed: 100, duration: 2000 },
            { steer: 0, speed: 100, duration: 2150 }, 
            { steer: 45, speed: -50, duration: 1800 },
            { steer: 0, speed: -50, duration: 1100 },
            { steer: 0, speed: -50, duration: 600 },
            { steer: -45, speed: -50, duration: 1800 },
            { steer: 0, speed: -20, duration: 500 }
        ];

        this.perpendicularManeuvers = [
            { steer: 0, speed: 100, duration: 1500 }, 
            { steer: 0, speed: 100, duration: 1500 }, 
            { steer: 0, speed: 100, duration: 2000 }, 
            { steer: 45, speed: -50, duration: 2000 }, 
            { steer: 45, speed: -50, duration: 1200 }, 
            { steer: 0, speed: -50, duration: 1200 }, 
            { steer: 0, speed: -50, duration: 800 } 
        ];

        this.turnManeuvers = [
            { steer: 0, speed: -100, duration: 2000 }, 
            { steer: -45, speed: 80, duration: 2300 }, 
            { steer: 45, speed: 0, duration: 1000 }, 
            { steer: 45, speed: -80, duration: 2400 }, 
            { steer: -45, speed: 80, duration: 2000 }, 
            { steer: 0, speed: 80, duration: 2200 } 
        ];

        window.updateTutorialCanvas = (scenario, stepIndex) => {
            if (this.canvas.width === 0) return;
            this.scenario = scenario;
            this.stepIndex = stepIndex;
            
            // Fast-forward physics to the start of the current step
            this.fastForwardToCurrentStep();
            
            this.lastTime = performance.now();
            this.currentManeuverTime = 0; // reset local step timer
            
            if (!this.animating) {
                this.animating = true;
                this.loop();
            }
        };
    }

    fastForwardToCurrentStep() {
        const start = this.startPoses[this.scenario];
        this.car.x = start.x;
        this.car.y = start.y;
        this.car.angle = start.a;
        this.car.speed = 0;
        this.car.setSteering(0);

        let maneuvers;
        if (this.scenario === 'parallel') maneuvers = this.parallelManeuvers;
        else if (this.scenario === 'perpendicular') maneuvers = this.perpendicularManeuvers;
        else if (this.scenario === 'turn') maneuvers = this.turnManeuvers;

        // Simulate physics up to the current step
        const dt = 1/60; // 60fps simulation step
        for (let i = 0; i < this.stepIndex; i++) {
            const m = maneuvers[i];
            if (!m) continue;
            this.car.setSteering(m.steer);
            this.car.speed = m.speed;
            const steps = Math.floor(m.duration / (dt * 1000));
            for (let s = 0; s < steps; s++) {
                this.car.update(dt);
            }
        }
        
        // Save state at the start of this step so we can loop it
        this.stepStartX = this.car.x;
        this.stepStartY = this.car.y;
        this.stepStartAngle = this.car.angle;
    }

    drawHelperLine(x1, y1, x2, y2, color, text = null) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 8]);
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 5, 0, Math.PI * 2);
        this.ctx.arc(x2, y2, 5, 0, Math.PI * 2);
        this.ctx.fill();

        if (text) {
            this.ctx.fillStyle = color;
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.textAlign = 'center';
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            this.ctx.fillText(text, mx, my - 10);
        }
    }

    loop() {
        if (!this.animating) return;
        
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // cap dt to avoid crazy physics jumps if tab is inactive
        if (dt < 0.1) {
            this.updatePhysics(dt);
        }
        
        this.render();
        requestAnimationFrame(() => this.loop());
    }

    updatePhysics(dt) {
        let maneuvers;
        if (this.scenario === 'parallel') maneuvers = this.parallelManeuvers;
        else if (this.scenario === 'perpendicular') maneuvers = this.perpendicularManeuvers;
        else if (this.scenario === 'turn') maneuvers = this.turnManeuvers;

        const m = maneuvers[this.stepIndex];
        if (!m) return; // Finished or invalid step

        this.currentManeuverTime += dt * 1000;

        // Loop step: Give a generous 1 second pause at the end of the maneuver before repeating
        if (this.currentManeuverTime > m.duration + 1000) {
            this.car.x = this.stepStartX;
            this.car.y = this.stepStartY;
            this.car.angle = this.stepStartAngle;
            this.currentManeuverTime = 0;
        }

        if (this.currentManeuverTime <= m.duration) {
            // Actively driving
            this.car.setSteering(m.steer);
            this.car.speed = m.speed;
            this.car.update(dt);
        } else {
            // Pausing phase
            this.car.speed = 0;
            this.car.setSteering(0);
            this.car.update(dt);
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawEnvironment(this.ctx, this.scenario, this.canvas.width, this.canvas.height);

        // Draw Car
        this.car.draw(this.ctx);

        // --- Contextual Reference Helper Lines ---
        const carA = this.car.angle;
        const carX = this.car.x;
        const carY = this.car.y;
        
        const carRearBumperX = carX - 15 * Math.cos(carA);
        const carRearBumperY = carY - 15 * Math.sin(carA);
        const carFrontBumperX = carX + 65 * Math.cos(carA);
        const carFrontBumperY = carY + 65 * Math.sin(carA);

        if (this.scenario === 'parallel') {
            const frontCarRearBumperX = 437.5; 
            const rearCarFrontPlateX = 192.5;  
            const rearCarFrontPlateY = 320;
            
            if (this.stepIndex === 0) {
                this.drawHelperLine(carX + 20, carY, carX + 20, 280, '#22c55e', '50cm Abstand');
            } else if (this.stepIndex === 1) {
                this.drawHelperLine(carRearBumperX, carRearBumperY, frontCarRearBumperX, 320, '#eab308', 'Heck auf Heck');
            } else if (this.stepIndex === 3) {
                const leftMirrorX = carX + 30 * Math.cos(carA) - (-23) * Math.sin(carA);
                const leftMirrorY = carY + 30 * Math.sin(carA) + (-23) * Math.cos(carA);
                this.drawHelperLine(leftMirrorX, leftMirrorY, rearCarFrontPlateX, rearCarFrontPlateY, '#ef4444', 'Sichtachse 45°');
            } else if (this.stepIndex === 4) {
                this.drawHelperLine(carFrontBumperX, carFrontBumperY, frontCarRearBumperX, 340, '#3b82f6', 'Front vorbei');
            }
        } else if (this.scenario === 'perpendicular') {
            if (this.stepIndex === 1) {
                this.drawHelperLine(carX, carY + 20, carX, 250, '#22c55e', '1,5m Abstand');
            } else if (this.stepIndex === 3) {
                this.drawHelperLine(carRearBumperX, carRearBumperY, 379, 298, '#eab308', 'Heck passiert');
            } else if (this.stepIndex === 5) {
                this.drawHelperLine(carX - 20, carY, 250, carY, '#3b82f6', 'Parallel');
                this.drawHelperLine(carX + 20, carY, 350, carY, '#3b82f6', 'Parallel');
            }
        } else if (this.scenario === 'turn') {
            if (this.stepIndex === 1) {
                this.drawHelperLine(carFrontBumperX, carFrontBumperY, carFrontBumperX, 150, '#eab308', 'Kante');
            } else if (this.stepIndex === 3) {
                this.drawHelperLine(carRearBumperX, carRearBumperY, carRearBumperX, 400, '#eab308', 'Kante');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appSimulator = new Simulator();
    window.tutorialRenderer = new TutorialRenderer();
});
