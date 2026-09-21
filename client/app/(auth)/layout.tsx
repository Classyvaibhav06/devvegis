import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-emerald-500/30 shadow-xs shrink-0 bg-white">
            <Image src="/logo.png" alt="DevVegis Logo" fill sizes="36px" className="object-cover" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg leading-tight block">
              <span className="text-emerald-600">Dev</span><span className="text-gray-800 dark:text-gray-100">Vegis</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide block">
              JK &amp; DK Daily Fresh Mart
            </span>
          </div>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
