class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.maxSpeed = 1.5;
        this.maxForce = 0.05;
        this.type = 'boid';
        this.size = 1.0; // Base size multiplier
        this.maxSize = 4; // Maximum size limit for boids
        this.detectionRange = 1.0; // Base detection range multiplier
        
        // Random color for each boid (no purple to avoid confusion with voids)
        const colors = [
            { primary: '#4CAF50', secondary: '#81C784', stroke: '#2E7D32' }, // Green
            { primary: '#2196F3', secondary: '#64B5F6', stroke: '#1976D2' }, // Blue
            { primary: '#FF9800', secondary: '#FFB74D', stroke: '#F57C00' }, // Orange
            { primary: '#E91E63', secondary: '#F06292', stroke: '#C2185B' }, // Pink
            { primary: '#00BCD4', secondary: '#4DD0E1', stroke: '#0097A7' }, // Cyan
            { primary: '#FF5722', secondary: '#FF8A65', stroke: '#D84315' }, // Red-Orange
            { primary: '#795548', secondary: '#A1887F', stroke: '#5D4037' }, // Brown
            { primary: '#FFC107', secondary: '#FFD54F', stroke: '#FF8F00' }  // Amber
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    // Apply a force to the boid
    applyForce(force) {
        this.vx += force.x;
        this.vy += force.y;
    }

    // Update boid position
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
    }

    // Draw the boid
    draw(ctx) {
        const angle = Math.atan2(this.vy, this.vx);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        // Draw boid as a triangle (scaled by size multiplier)
        ctx.beginPath();
        ctx.moveTo(8 * this.size, 0);
        ctx.lineTo(-4 * this.size, -3 * this.size);
        ctx.lineTo(-4 * this.size, 3 * this.size);
        ctx.closePath();
        
        // Create gradient for boid using random color
        const gradient = ctx.createLinearGradient(-4, -3, 8, 0);
        gradient.addColorStop(0, this.color.primary);
        gradient.addColorStop(1, this.color.secondary);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = this.color.stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

class Void {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.3; // Much slower than boids
        this.vy = (Math.random() - 0.5) * 0.3;
        this.maxSpeed = 0.3; // Slower max speed
        this.maxForce = 0.01; // Even gentler steering (slower turning)
        this.type = 'void';
        this.radius = 7;
        this.maxRadius = 25; // Maximum size limit for voids
        this.consumedBoids = 0; // Track how many boids this void has consumed
        this.lastCollisionTime = 0; // Track when this void last collided with another max-sized void
    }

    // Apply a force to the void
    applyForce(force) {
        this.vx += force.x;
        this.vy += force.y;
    }

    // Update void position
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
    }

    // Draw the void
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw void as a dark purple sphere
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        
        // Create radial gradient for void - darker center based on consumed boids
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        
        // Calculate darkness based on consumed boids (darker = more consumed)
        const darknessFactor = Math.min(this.consumedBoids * 0.1, 0.5); // Max 50% darker
        const centerDarkness = Math.max(0.1, 0.4 - darknessFactor); // Darker center
        
        gradient.addColorStop(0, `rgba(74, 20, 140, ${centerDarkness})`); // Darker purple center
        gradient.addColorStop(0.7, '#8E24AA'); // Medium purple
        gradient.addColorStop(1, '#4A148C'); // Darker purple edge
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.shadowColor = '#6A1B9A';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#4A148C';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

class Explosion {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.life = 30; // Frames the explosion lasts
        this.maxLife = 30;
        
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: this.life,
                maxLife: this.life,
                color: color
            });
        }
    }
    
    update() {
        this.life--;
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95; // Slow down
            particle.vy *= 0.95;
            particle.life--;
        }
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        for (let particle of this.particles) {
            const particleAlpha = particle.life / particle.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha * particleAlpha;
            
            // Draw particle as a small circle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.primary;
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = particle.color.primary;
            ctx.shadowBlur = 8;
            ctx.strokeStyle = particle.color.secondary;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    isDead() {
        return this.life <= 0;
    }
}

class BoidsSimulation {
    constructor() {
        this.canvas = document.getElementById('boidsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.boids = [];
        this.voids = [];
        this.explosions = [];
        this.speedMultiplier = 2.0;
        // Determine boid and void count based on screen size
        this.adjustBoidCount();
        //this.boidCount = 300;
        //this.voidCount = 8;
        this.neighborRadius = 50;
        this.separationWeight = 1.5;
        this.alignmentWeight = 1.0;
        this.cohesionWeight = 1.0;
        this.frameCount = 0; // Track frame count for collision cooldown
        
        this.resizeCanvas();
        this.setupControls();
        this.setupResizeHandler();
        this.animate();
    }

    initializeEntities() {
        this.boids = [];
        this.voids = [];
        this.explosions = [];
        
        // Initialize boids
        for (let i = 0; i < this.boidCount; i++) {
            this.boids.push(new Boid(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
        
        // Initialize voids
        for (let i = 0; i < this.voidCount; i++) {
            this.voids.push(new Void(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    adjustBoidCount() {
        this.boidCount = Math.floor(window.innerWidth * window.innerHeight / 6000);
        document.getElementById('boidCount').value = this.boidCount;
        this.voidCount = Math.max(Math.floor(this.boidCount / 30), 2);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.adjustBoidCount();
            this.initializeEntities();
        });
    }

    setupControls() {
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const boidCountInput = document.getElementById('boidCount');

        // Initialize based off the input elements
        this.speedMultiplier = parseFloat(speedSlider.value);
        let newCount = parseInt(boidCountInput.value);
        if (newCount >= boidCountInput.getAttribute('min') && newCount <= boidCountInput.getAttribute('max')) {
            this.boidCount = newCount;
            this.initializeEntities();
        }

        speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            speedValue.textContent = String(e.target.value/e.target.max*100) + '%';
        });

        boidCountInput.addEventListener('change', (e) => {
            const newCount = parseInt(e.target.value);
            if (newCount >= boidCountInput.getAttribute('min') && newCount <= boidCountInput.getAttribute('max')) {
                this.boidCount = newCount;
                this.initializeEntities();
            }
        });
    }

    // Calculate separation force (avoid crowding)
    separation(entity) {
        let steerX = 0;
        let steerY = 0;
        let count = 0;

        // For boids: separate from other boids and voids
        if (entity.type === 'boid') {
            // Separate from other boids
            for (let other of this.boids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * entity.detectionRange) {
                    const force = 1 / distance;
                    steerX += dx * force;
                    steerY += dy * force;
                    count++;
                }
            }
            
            // Separate from voids (high separation weight)
            for (let void_ of this.voids) {
                const dx = entity.x - void_.x;
                const dy = entity.y - void_.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Detection range scales with void radius - larger voids are detected from further away
                const voidDetectionRange = this.neighborRadius * 1.2 + (void_.radius - 7) * 2; // Base range + scaling factor
                
                if (distance > 0 && distance < voidDetectionRange) {
                    const force = 1 / distance;
                    steerX += dx * force;
                    steerY += dy * force;
                    count++;
                }
            }
        }

        if (count > 0) {
            steerX /= count;
            steerY /= count;
            
            // Normalize and apply weight (higher separation for voids and boids avoiding voids)
            const magnitude = Math.sqrt(steerX * steerX + steerY * steerY);
            if (magnitude > 0) {
                let separationWeight;
                if (entity.type === 'void') {
                    separationWeight = 3.0; // Voids avoid other voids
                } else if (entity.type === 'boid' && count > 0) {
                    // Check if any of the separation forces are from voids
                    let hasVoidSeparation = false;
                    for (let void_ of this.voids) {
                        const dx = entity.x - void_.x;
                        const dy = entity.y - void_.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > 0 && distance < this.neighborRadius * entity.detectionRange * 1.2) {
                            hasVoidSeparation = true;
                            break;
                        }
                    }
                    separationWeight = hasVoidSeparation ? 2.5 : this.separationWeight; // Higher separation from voids
                } else {
                    separationWeight = this.separationWeight;
                }
                steerX = (steerX / magnitude) * entity.maxForce * separationWeight;
                steerY = (steerY / magnitude) * entity.maxForce * separationWeight;
            }
        }

        return { x: steerX, y: steerY };
    }

    // Calculate alignment force (steer toward average heading)
    alignment(entity) {
        let avgVx = 0;
        let avgVy = 0;
        let count = 0;

        if (entity.type === 'boid') {
            for (let other of this.boids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * entity.detectionRange) {
                    avgVx += other.vx;
                    avgVy += other.vy;
                    count++;
                }
            }
        } else if (entity.type === 'void') {
            for (let other of this.voids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * entity.detectionRange) {
                    avgVx += other.vx;
                    avgVy += other.vy;
                    count++;
                }
            }
        }

        if (count > 0) {
            avgVx /= count;
            avgVy /= count;
            
            // Normalize and apply weight
            const magnitude = Math.sqrt(avgVx * avgVx + avgVy * avgVy);
            if (magnitude > 0) {
                avgVx = (avgVx / magnitude) * entity.maxForce * this.alignmentWeight;
                avgVy = (avgVy / magnitude) * entity.maxForce * this.alignmentWeight;
            }
        }

        return { x: avgVx, y: avgVy };
    }

    // Calculate cohesion force (steer toward average position)
    cohesion(entity) {
        let centerX = 0;
        let centerY = 0;
        let count = 0;

        if (entity.type === 'boid') {
            for (let other of this.boids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * entity.detectionRange) {
                    centerX += other.x;
                    centerY += other.y;
                    count++;
                }
            }
        } else if (entity.type === 'void') {
            // Voids have high cohesion with boids
            for (let other of this.boids) {
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * 1.5) { // Larger radius for void-boid cohesion
                    centerX += other.x;
                    centerY += other.y;
                    count++;
                }
            }
        }

        if (count > 0) {
            centerX /= count;
            centerY /= count;
            
            const steerX = centerX - entity.x;
            const steerY = centerY - entity.y;
            
            // Normalize and apply weight (higher cohesion for voids with boids)
            const magnitude = Math.sqrt(steerX * steerX + steerY * steerY);
            if (magnitude > 0) {
                const cohesionWeight = entity.type === 'void' ? 2.5 : this.cohesionWeight;
                return {
                    x: (steerX / magnitude) * entity.maxForce * cohesionWeight,
                    y: (steerY / magnitude) * entity.maxForce * cohesionWeight
                };
            }
        }

        return { x: 0, y: 0 };
    }

    update() {
        this.frameCount++;
        
        // Update boids
        for (let i = this.boids.length - 1; i >= 0; i--) {
            const boid = this.boids[i];
            
            // Apply flocking forces
            const separation = this.separation(boid);
            const alignment = this.alignment(boid);
            const cohesion = this.cohesion(boid);

            boid.applyForce(separation);
            boid.applyForce(alignment);
            boid.applyForce(cohesion);

            // Limit speed before applying multiplier
            const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
            if (speed > boid.maxSpeed) {
                boid.vx = (boid.vx / speed) * boid.maxSpeed;
                boid.vy = (boid.vy / speed) * boid.maxSpeed;
            }

            // Update position with speed multiplier
            boid.x += boid.vx * this.speedMultiplier;
            boid.y += boid.vy * this.speedMultiplier;
            
            // Wrap around edges
            if (boid.x < 0) boid.x = this.canvas.width;
            if (boid.x > this.canvas.width) boid.x = 0;
            if (boid.y < 0) boid.y = this.canvas.height;
            if (boid.y > this.canvas.height) boid.y = 0;
            
            // Check collision with voids
            let voidCollision = false;
            for (let void_ of this.voids) {
                const dx = boid.x - void_.x;
                const dy = boid.y - void_.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < void_.radius + 8 * boid.size) { // Scale collision detection with boid size
                    // Create explosion at boid position
                    this.explosions.push(new Explosion(boid.x, boid.y, boid.color));
                    
                    // Handle void absorption based on current size
                    if (void_.radius < void_.maxRadius) {
                        // Normal absorption - increase radius by boid size
                        void_.radius = Math.min(void_.radius + boid.size, void_.maxRadius);
                        void_.consumedBoids += 1;
                    } else {
                        // Void is at max size - reset and release new boids
                        const sizeLost = void_.radius - 7; // Calculate how much size was lost
                        void_.radius = 7; // Reset to default size
                        void_.consumedBoids = 0; // Reset consumed boids count
                        
                        // Create new boids in a circle around the void
                        this.createBoidsFromVoid(void_, sizeLost);
                    }
                    
                    voidCollision = true;
                    break;
                }
            }
            
            // Check collision with other boids of same color
            let boidCombined = false;
            if (!voidCollision) {
                for (let j = this.boids.length - 1; j > i; j--) {
                    const otherBoid = this.boids[j];
                    
                    // Check if same color and not at max size
                    if (boid.color.primary === otherBoid.color.primary && 
                        boid.size < boid.maxSize && otherBoid.size < otherBoid.maxSize) {
                        const dx = boid.x - otherBoid.x;
                        const dy = boid.y - otherBoid.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Collision detection based on boid sizes
                        const collisionDistance = (8 * boid.size + 8 * otherBoid.size) * 0.8; // 80% of combined size
                        
                        if (distance < collisionDistance) {
                            // Combine boids
                            this.combineBoids(boid, otherBoid, i, j);
                            boidCombined = true;
                            break;
                        }
                    }
                }
            }
            
            // Remove boid if void collision occurred
            if (voidCollision) {
                this.boids.splice(i, 1);
            }
        }

        // Update voids
        for (let i = this.voids.length - 1; i >= 0; i--) {
            const void_ = this.voids[i];
            
            // Apply flocking forces
            const separation = this.separation(void_);
            const alignment = this.alignment(void_);
            const cohesion = this.cohesion(void_);

            void_.applyForce(separation);
            void_.applyForce(alignment);
            void_.applyForce(cohesion);

            // Limit speed before applying multiplier
            const speed = Math.sqrt(void_.vx * void_.vx + void_.vy * void_.vy);
            if (speed > void_.maxSpeed) {
                void_.vx = (void_.vx / speed) * void_.maxSpeed;
                void_.vy = (void_.vy / speed) * void_.maxSpeed;
            }

            // Update position with speed multiplier
            void_.x += void_.vx * this.speedMultiplier;
            void_.y += void_.vy * this.speedMultiplier;
            
            // Wrap around edges
            if (void_.x < 0) void_.x = this.canvas.width;
            if (void_.x > this.canvas.width) void_.x = 0;
            if (void_.y < 0) void_.y = this.canvas.height;
            if (void_.y > this.canvas.height) void_.y = 0;
            
            // Check collision with other voids
            let absorbed = false;
            for (let j = this.voids.length - 1; j >= 0; j--) {
                if (i === j) continue; // Skip self
                
                const otherVoid = this.voids[j];
                const dx = void_.x - otherVoid.x;
                const dy = void_.y - otherVoid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < void_.radius + otherVoid.radius) {
                    // Determine which void is larger
                    if (void_.radius >= otherVoid.radius) {
                        // Check if this void can absorb (not at max size)
                        if (void_.radius < void_.maxRadius) {
                            // This void absorbs the other
                            const absorbedRadius = otherVoid.radius * 0.5; // Half of smaller void's radius
                            const newRadius = void_.radius + absorbedRadius;
                            
                            // Cap the radius at maximum
                            void_.radius = Math.min(newRadius, void_.maxRadius);
                            void_.consumedBoids += otherVoid.consumedBoids; // Transfer consumed boids count
                            
                            // Create absorption effect at the smaller void's position
                            this.explosions.push(new Explosion(otherVoid.x, otherVoid.y, { primary: '#6A1B9A', secondary: '#8E24AA' }));
                            
                            // Remove the smaller void
                            this.voids.splice(j, 1);
                            if (j < i) i--; // Adjust index since we removed an element
                        }
                        // If at max size, no absorption occurs - trigger spiral and launch
                        else if (void_.radius >= void_.maxRadius && otherVoid.radius >= otherVoid.maxRadius) {
                            // Check collision cooldown to prevent getting stuck
                            const cooldownFrames = 90; // 1 second at 60fps
                            if (this.frameCount - void_.lastCollisionTime > cooldownFrames && 
                                this.frameCount - otherVoid.lastCollisionTime > cooldownFrames) {
                                // Both voids are at max size - spiral and launch away
                                this.spiralAndLaunch(void_, otherVoid);
                                void_.lastCollisionTime = this.frameCount;
                                otherVoid.lastCollisionTime = this.frameCount;
                            }
                        }
                    } else {
                        // This void gets absorbed by the other (if the other can absorb)
                        if (otherVoid.radius < otherVoid.maxRadius) {
                            absorbed = true;
                            break;
                        }
                        // If the larger void is at max size, no absorption occurs - trigger spiral and launch
                        else if (void_.radius >= void_.maxRadius && otherVoid.radius >= otherVoid.maxRadius) {
                            // Check collision cooldown to prevent getting stuck
                            const cooldownFrames = 60; // 1 second at 60fps
                            if (this.frameCount - void_.lastCollisionTime > cooldownFrames && 
                                this.frameCount - otherVoid.lastCollisionTime > cooldownFrames) {
                                // Both voids are at max size - spiral and launch away
                                this.spiralAndLaunch(void_, otherVoid);
                                void_.lastCollisionTime = this.frameCount;
                                otherVoid.lastCollisionTime = this.frameCount;
                            }
                        }
                    }
                }
            }
            
            // Remove this void if it was absorbed
            if (absorbed) {
                this.voids.splice(i, 1);
            }
        }
        
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update();
            if (this.explosions[i].isDead()) {
                this.explosions.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas with semi-transparent background for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all boids
        for (let boid of this.boids) {
            boid.draw(this.ctx);
        }

        // Draw all voids
        for (let void_ of this.voids) {
            void_.draw(this.ctx);
        }
        
        // Draw all explosions
        for (let explosion of this.explosions) {
            explosion.draw(this.ctx);
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    combineBoids(boid1, boid2, index1, index2) {
        // Calculate center point between the two boids
        const centerX = (boid1.x + boid2.x) / 2;
        const centerY = (boid1.y + boid2.y) / 2;
        
        // Calculate average velocity
        const avgVx = (boid1.vx + boid2.vx) / 2;
        const avgVy = (boid1.vy + boid2.vy) / 2;
        
        // Create new combined boid with enhanced properties
        const combinedBoid = new Boid(centerX, centerY);
        combinedBoid.color = boid1.color; // Keep the same color
        combinedBoid.size = Math.min(boid1.size + 1, boid1.maxSize); // Increase size by 1, cap at max
        combinedBoid.maxSpeed = boid1.maxSpeed * 1.1; // Increase speed by 10%
        combinedBoid.detectionRange = 1.0 + (combinedBoid.size - 1) * 0.5; // Base + (size-1) * 0.5
        combinedBoid.vx = avgVx;
        combinedBoid.vy = avgVy;
        
        // Create combination effect
        this.explosions.push(new Explosion(centerX, centerY, boid1.color));
        
        // Replace the first boid with the combined one
        this.boids[index1] = combinedBoid;
        
        // Remove the second boid
        this.boids.splice(index2, 1);
    }

    createBoidsFromVoid(void_, sizeLost) {
        // Boid colors array (same as in Boid constructor)
        const colors = [
            { primary: '#4CAF50', secondary: '#81C784', stroke: '#2E7D32' }, // Green
            { primary: '#2196F3', secondary: '#64B5F6', stroke: '#1976D2' }, // Blue
            { primary: '#FF9800', secondary: '#FFB74D', stroke: '#F57C00' }, // Orange
            { primary: '#E91E63', secondary: '#F06292', stroke: '#C2185B' }, // Pink
            { primary: '#00BCD4', secondary: '#4DD0E1', stroke: '#0097A7' }, // Cyan
            { primary: '#FF5722', secondary: '#FF8A65', stroke: '#D84315' }, // Red-Orange
            { primary: '#795548', secondary: '#A1887F', stroke: '#5D4037' }, // Brown
            { primary: '#FFC107', secondary: '#FFD54F', stroke: '#FF8F00' }  // Amber
        ];
        
        // Purple color for one of the new boids
        const purpleColor = { primary: '#9C27B0', secondary: '#BA68C8', stroke: '#7B1FA2' };
        
        // Create boids in a circle around the void
        const numBoids = Math.floor(sizeLost);
        const radius = 30; // Distance from void center
        
        for (let i = 0; i < numBoids; i++) {
            // Calculate position in circle
            const angle = (Math.PI * 2 * i) / numBoids;
            const x = void_.x + Math.cos(angle) * radius;
            const y = void_.y + Math.sin(angle) * radius;
            
            // Create new boid
            const newBoid = new Boid(x, y);
            
            // Set color - one purple, rest random
            if (i === 0) {
                newBoid.color = purpleColor;
            } else {
                newBoid.color = colors[Math.floor(Math.random() * colors.length)];
            }
            
            // Set velocity facing away from void
            const velocityMagnitude = 2.0;
            newBoid.vx = Math.cos(angle) * velocityMagnitude;
            newBoid.vy = Math.sin(angle) * velocityMagnitude;
            
            // Add to boids array
            this.boids.push(newBoid);
        }
        
        // Create explosion effect at void position
        this.explosions.push(new Explosion(void_.x, void_.y, { primary: '#6A1B9A', secondary: '#8E24AA' }));
    }

    spiralAndLaunch(void1, void2) {
        // Calculate center point between the two voids
        const centerX = (void1.x + void2.x) / 2;
        const centerY = (void1.y + void2.y) / 2;
        
        // Calculate distance between voids
        const dx = void2.x - void1.x;
        const dy = void2.y - void1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create spiral effect by applying tangential forces
        const angle = Math.atan2(dy, dx);
        const tangentialAngle = angle + Math.PI / 2; // Perpendicular to line between voids
        
        // Apply spiral forces (opposite directions for each void)
        const spiralForce = 3.0;
        void1.vx += Math.cos(tangentialAngle) * spiralForce;
        void1.vy += Math.sin(tangentialAngle) * spiralForce;
        void2.vx += Math.cos(tangentialAngle + Math.PI) * spiralForce; // Opposite direction
        void2.vy += Math.sin(tangentialAngle + Math.PI) * spiralForce;
        
        // Apply repulsion force to launch them apart
        const repulsionForce = 7.0; // Much stronger repulsion
        const repulsionAngle = angle; // Away from each other
        void1.vx += Math.cos(repulsionAngle) * repulsionForce;
        void1.vy += Math.sin(repulsionAngle) * repulsionForce;
        void2.vx += Math.cos(repulsionAngle + Math.PI) * repulsionForce; // Opposite direction
        void2.vy += Math.sin(repulsionAngle + Math.PI) * repulsionForce;
        
        // Create explosion effect at the collision point
        this.explosions.push(new Explosion(centerX, centerY, { primary: '#6A1B9A', secondary: '#8E24AA' }));
        
        // Add a second explosion effect for dramatic impact
        setTimeout(() => {
            this.explosions.push(new Explosion(centerX, centerY, { primary: '#4A148C', secondary: '#6A1B9A' }));
        }, 100);
    }
}

// Start the simulation when the page loads
window.addEventListener('load', () => {
    new BoidsSimulation();
}); 