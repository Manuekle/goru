'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Trust from '@/components/Trust'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import MultiVenue from '@/components/MultiVenue'
import Pricing from '@/components/Pricing'
import Stats from '@/components/Stats'
import Testimonial from '@/components/Testimonial'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'
import Modal from '@/components/Modal'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const open = () => setModalOpen(true)
  const close = () => setModalOpen(false)

  return (
    <>
      <div className="atmos" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <Nav />

      <main className="frame">
        <Hero onOpen={open} />
        <Trust />
        <HowItWorks />
        <Features />
        <MultiVenue />
        <Pricing onOpen={open} />
        <Stats />
        <Testimonial />
        <FinalCTA onOpen={open} />
      </main>

      <Footer />
      <Modal open={modalOpen} onClose={close} />
    </>
  )
}
