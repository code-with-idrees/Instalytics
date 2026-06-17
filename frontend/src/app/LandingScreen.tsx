'use client';

import React from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls } from "@react-three/drei";
import { Zap } from "lucide-react";

export default function LandingScreen() {
  const texts = [
    "Welcome to Instalytics",
    "AI‑powered Instagram Reel insights",
    "Turn data into content plans"
  ];

  return (
    <section className="relative min-h-screen bg-mesh flex items-center justify-center overflow-hidden">
      {/* 3D animated mesh background */}
      <Canvas className="absolute inset-0" camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <mesh rotation={[0.4, 0.2, 0]}>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <MeshDistortMaterial
            distort={0.3}
            speed={2}
            color="#6e4cff"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate />
      </Canvas>

      {/* Content overlay */}
      <div className="relative z-10 text-center space-y-6">
        {texts.map((t, i) => (
          <h1
            key={i}
            className={"text-4xl md:text-6xl font-bold text-white animate-fade-slide-up-delay"}
          >
            {t}
          </h1>
        ))}
        <Link href="/dashboard">
          <button className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg btn-glow hover:scale-105 flex items-center gap-2 mx-auto">
            <Zap size={24} className="hover-spin" />
            <span>Get Started</span>
          </button>
        </Link>
      </div>
    </section>
  );
}
