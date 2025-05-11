import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/mode-toggle';

export function Header() {
  const navLinks = [
    {
      href: 'https://www.projectclay.com/meet-your-mentors',
      label: 'Browse mentors'
    },
    {
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSfyQUZWh8VcY1Zx7S8fnS45E_3I77kEGfh30Wc0v5fJzy3REw/viewform',
      label: 'Ivy 10'
    },
    {
      href: 'https://calendly.com/dyumnamadan01/intro-meeting?month=2025-04',
      label: 'Book a Call'
    },
    {
      href: 'https://chat.whatsapp.com/KfU9XRXYLIJIGkfuJsgZAj',
      label: 'Join Community'
    }
  ];

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link 
            href="https://www.projectclay.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-bold text-xl tracking-tight"
          >
            Project Clay
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="https://www.projectclay.com/meet-your-mentors#registrationform"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-1 border-zinc-700 text-white">
              Register now
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Button>
          </Link>
          <ModeToggle />
        </nav>

        {/* Mobile navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-900 border-zinc-800">
              <div className="flex flex-col gap-4 mt-6">
                {navLinks.map((link, index) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-zinc-300 hover:text-white transition-colors block py-2"
                    >
                      {link.label}
                    </Link>
                    {index < navLinks.length - 1 && <Separator className="my-2 bg-zinc-800" />}
                  </div>
                ))}
                <Link
                  href="https://www.projectclay.com/meet-your-mentors#registrationform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2"
                >
                  <Button variant="outline" className="w-full gap-1 border-zinc-700 text-white">
                    Register now
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </Link>
                <div className="mt-4 flex justify-center">
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 