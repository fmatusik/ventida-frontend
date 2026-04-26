import Link from 'next/link';

export default function Logo() {
    return (
        <Link href="/">
            <h1 className="text-xl sm:text-2xl font-light text-primary tracking-tight">
            <span className="font-semibold">ventida</span>
            </h1>
        </Link>
    )
  }