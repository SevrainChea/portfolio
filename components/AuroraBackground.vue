<template>
  <div class="aurora-bg" aria-hidden="true">
    <div class="bg-grad" />
    <div class="blobs">
      <div class="blob b1" />
      <div class="blob b2" />
      <div class="blob b3" />
    </div>
    <div class="grain" />
  </div>
</template>

<script setup lang="ts">
// Fixed, full-bleed Aurora background: solid --th-bg, a radial --th-bg-grad,
// three blurred animated "aurora" blobs, and a faint SVG grain overlay.
// Token-driven, so it re-colors on every variant/mode switch.
</script>

<style scoped>
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--th-bg);
  transition: background 0.6s ease;
}
.bg-grad {
  position: absolute;
  inset: 0;
  background: var(--th-bg-grad);
  transition: background 0.6s ease;
}
.blobs {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  mix-blend-mode: var(--th-blob-blend);
  opacity: var(--th-blob-op);
  transition:
    background 0.6s ease,
    opacity 0.6s ease;
}
.b1 {
  width: 680px;
  height: 680px;
  left: -220px;
  top: -200px;
  background: radial-gradient(
    circle at 40% 40%,
    var(--th-blob-1),
    transparent 60%
  );
  animation: flA 38s ease-in-out infinite;
}
.b2 {
  width: 560px;
  height: 560px;
  left: 120px;
  top: 60px;
  background: radial-gradient(
    circle at 50% 50%,
    var(--th-blob-2),
    transparent 60%
  );
  animation: flB 46s ease-in-out infinite;
  opacity: calc(var(--th-blob-op) * 0.64);
}
.b3 {
  width: 520px;
  height: 520px;
  left: -120px;
  top: 340px;
  background: radial-gradient(
    circle at 50% 50%,
    var(--th-blob-3),
    transparent 60%
  );
  animation: flC 50s ease-in-out infinite;
  opacity: calc(var(--th-blob-op) * 0.6);
}
@keyframes flA {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(70px, 60px);
  }
}
@keyframes flB {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-60px, 50px);
  }
}
@keyframes flC {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(60px, -50px);
  }
}
.grain {
  position: absolute;
  inset: 0;
  opacity: var(--th-grain-op);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Calmer on small screens and for reduced-motion users. */
@media (max-width: 880px) {
  .blob {
    filter: blur(90px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
}
</style>
