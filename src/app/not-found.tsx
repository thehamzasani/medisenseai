// import Link from 'next/link'

// export default function NotFound() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background">
//       {/* Atmospheric background */}
//       <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
//         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
//         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
//       </div>

//       <div className="text-center px-6">
//         {/* Large 404 */}
//         <div className="mb-4">
//           <span
//             className="gradient-text font-black"
//             style={{ fontSize: '120px', lineHeight: '1', display: 'block' }}
//           >
//             404
//           </span>
//         </div>

//         {/* MediSense AI branding */}
//         <div className="flex items-center justify-center gap-2 mb-6">
//           <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
//             MediSense AI
//           </span>
//           <span className="text-on-surface-variant/40">·</span>
//           <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
//             Clinical Intelligence
//           </span>
//         </div>

//         {/* Message */}
//         <h1 className="text-headline-lg font-bold text-on-surface mb-3">
//           Page not found
//         </h1>
//         <p className="text-body-md text-on-surface-variant mb-10 max-w-sm mx-auto">
//           The clinical data you&apos;re looking for doesn&apos;t exist or has been moved to another location.
//         </p>

//         {/* Actions */}
//         <div className="flex items-center justify-center gap-4">
//           <Link
//             href="/dashboard"
//             className="btn-cyan px-8 py-3 text-label-md font-bold rounded-full inline-flex items-center gap-2"
//           >
//             <span className="material-symbols-outlined text-[18px]">dashboard</span>
//             Go to Dashboard
//           </Link>
//           <Link
//             href="/assessment/new"
//             className="inline-flex items-center gap-2 px-8 py-3 text-label-md font-medium text-on-surface-variant border border-outline-variant rounded-full hover:border-primary-fixed-dim/40 hover:text-primary transition-all duration-200"
//           >
//             <span className="material-symbols-outlined text-[18px]">add_circle</span>
//             New Assessment
//           </Link>
//         </div>

//         {/* Decorative element */}
//         <div className="mt-16 flex items-center justify-center gap-3 opacity-30">
//           {[...Array(5)].map((_, i) => (
//             <div
//               key={i}
//               className="rounded-full bg-primary-fixed-dim"
//               style={{
//                 width: i === 2 ? '8px' : '4px',
//                 height: i === 2 ? '8px' : '4px',
//                 opacity: i === 2 ? 1 : 0.5,
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }


// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">

      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      <div className="text-center px-6">
        {/* 404 */}
        <div className="text-[160px] font-black leading-none gradient-text mb-4 select-none">
          404
        </div>

        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-3xl">search_off</span>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-headline-lg font-bold text-on-surface mb-3">Page not found</h1>
        <p className="text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to your dashboard.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="btn-cyan px-8 py-3 text-base flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-8 py-3 rounded-full border border-outline-variant text-on-surface hover:border-primary-fixed-dim hover:text-primary-fixed-dim transition-colors text-base font-semibold"
          >
            Back to Home
          </Link>
        </div>

        {/* Decorative scan line */}
        <div className="mt-16 flex items-center justify-center gap-3 text-on-surface-variant">
          <div className="h-px w-16 bg-outline-variant" />
          <span className="material-symbols-outlined text-sm text-outline">medical_services</span>
          <div className="h-px w-16 bg-outline-variant" />
        </div>
        <p className="text-label-sm text-outline mt-2">MediSense AI — Clinical Intelligence v3</p>
      </div>
    </div>
  )
}