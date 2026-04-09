import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, LogOut, User, LayoutDashboard, ChevronDown, Mail, Phone, Facebook, Twitter, Instagram, Youtube, Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoPng from "@assets/logo_1772459405886.png";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const toggleLang = (lng: string) => i18n.changeLanguage(lng);

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={`${mobile ? 'flex w-full justify-between items-center py-2' : 'flex items-center gap-1'} text-sm font-bold text-muted-foreground hover:text-foreground transition-colors outline-none whitespace-nowrap`}>
          Faith Activities <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <div className="font-bold text-[10px] uppercase text-muted-foreground/60 px-2 py-1.5 tracking-widest">Spiritual Growth</div>
          <Link href="/worship"><DropdownMenuItem className="cursor-pointer">Worship</DropdownMenuItem></Link>
          <Link href="/reading"><DropdownMenuItem className="cursor-pointer">Reading</DropdownMenuItem></Link>
          <Link href="/meditation"><DropdownMenuItem className="cursor-pointer">Meditation</DropdownMenuItem></Link>
          <DropdownMenuSeparator />
          <div className="font-bold text-[10px] uppercase text-muted-foreground/60 px-2 py-1.5 tracking-widest">Community</div>
          <Link href="/games"><DropdownMenuItem className="cursor-pointer">Games</DropdownMenuItem></Link>
          <Link href="/testimonies"><DropdownMenuItem className="cursor-pointer">Testimonies</DropdownMenuItem></Link>
          <Link href="/prayers"><DropdownMenuItem className="cursor-pointer">Prayers</DropdownMenuItem></Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className={`${mobile ? 'flex w-full justify-between items-center py-2' : 'flex items-center gap-1'} text-sm font-bold text-muted-foreground hover:text-foreground transition-colors outline-none whitespace-nowrap`}>
          Along Activities <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <Link href="/testimony-along"><DropdownMenuItem className="cursor-pointer">Testimony Along</DropdownMenuItem></Link>
          <Link href="/pray-along"><DropdownMenuItem className="cursor-pointer">Pray Along</DropdownMenuItem></Link>
          <Link href="/sing-along"><DropdownMenuItem className="cursor-pointer">Sing Along</DropdownMenuItem></Link>
          <Link href="/read-along"><DropdownMenuItem className="cursor-pointer">Read Along</DropdownMenuItem></Link>
          <Link href="/meditate-along"><DropdownMenuItem className="cursor-pointer">Meditate Along</DropdownMenuItem></Link>
          <Link href="/game-along"><DropdownMenuItem className="cursor-pointer">Game Along</DropdownMenuItem></Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/courses" className={`${mobile ? 'py-2 block' : ''} text-sm font-bold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap ${location === '/courses' ? 'text-primary' : ''}`}>
        Courses
      </Link>
      <Link href="/donate" className={`${mobile ? 'py-2 block' : ''} text-sm font-bold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap ${location === '/donate' ? 'text-primary' : ''}`}>
        Donate
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src={logoPng} alt="Biblical Financial Courses" className="h-12 md:h-14 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <NavItems />
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Language & Theme - Desktop/Mobile shared visible */}
            <div className="hidden sm:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 px-2 h-9">
                    <Globe className="w-4 h-4" />
                    <span className="hidden xl:inline">English</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleLang('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLang('sw')}>Swahili</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLang('fr')}>Français</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLang('ar')}>العربية</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLang('pt')}>Português</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* Auth - Desktop/Mobile shared visible */}
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full gap-2 pl-2 h-9">
                      <img 
                        src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}&background=random`} 
                        alt="Avatar" 
                        className="w-7 h-7 rounded-full"
                      />
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex rounded-full h-9"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="rounded-full font-bold text-sm h-9 px-4 shadow-sm hover:shadow-md transition-all">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-md h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] overflow-y-auto">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle>
                    <img src={logoPng} alt="Logo" className="h-8 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  <NavItems mobile />
                  <div className="h-px bg-border my-2" />
                  <div className="flex flex-col gap-4">
                    {isAuthenticated && (
                      <div className="space-y-2">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start rounded-full">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full justify-start rounded-full"
                          onClick={async () => {
                            await logout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
                      <span>Appearance</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      >
                        {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-muted-foreground">Language</span>
                      <div className="grid grid-cols-2 gap-2">
                        {['en', 'sw', 'fr', 'ar', 'pt'].map((lng) => (
                          <Button 
                            key={lng} 
                            variant={i18n.language === lng ? "default" : "outline"} 
                            size="sm" 
                            className="h-8 text-xs font-bold capitalize"
                            onClick={() => toggleLang(lng)}
                          >
                            {lng === 'sw' ? 'Swahili' : lng === 'ar' ? 'العربية' : lng === 'pt' ? 'Português' : lng === 'fr' ? 'Français' : 'English'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-background border-t pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start space-y-6">
              <img src={logoPng} alt="Logo" className="h-12 w-auto" />
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
                A community of faith where believers come together to worship, pray, study, and grow spiritually.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#"><Facebook className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" /></Link>
                <Link href="#"><Twitter className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" /></Link>
                <Link href="#"><Instagram className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" /></Link>
                <Link href="#"><Youtube className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" /></Link>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-bold text-lg mb-6">Faith Activities</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/worship" className="hover:text-primary transition-colors">Worship</Link></li>
                <li><Link href="/reading" className="hover:text-primary transition-colors">Reading</Link></li>
                <li><Link href="/meditation" className="hover:text-primary transition-colors">Meditation</Link></li>
                <li><Link href="/games" className="hover:text-primary transition-colors">Games</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-bold text-lg mb-6">Community</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/testimonies" className="hover:text-primary transition-colors">Testimonies</Link></li>
                <li><Link href="/prayers" className="hover:text-primary transition-colors">Prayers</Link></li>
                <li><Link href="/donate" className="hover:text-primary transition-colors">Donate</Link></li>
              </ul>
              <h4 className="font-bold text-lg mt-8 mb-6">Along Activities</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/testimony-along" className="hover:text-primary transition-colors">Testimony Along</Link></li>
                <li><Link href="/pray-along" className="hover:text-primary transition-colors">Pray Along</Link></li>
                <li><Link href="/sing-along" className="hover:text-primary transition-colors">Sing Along</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-bold text-lg mb-6">Get in Touch</h4>
              <ul className="space-y-4 text-sm text-muted-foreground mb-8 text-center sm:text-left">
                <li className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="break-all">info@biblicalfinancialcourses.com</span>
                </li>
                <li className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>+1 (651) 348-9258</span>
                </li>
              </ul>
              <h4 className="font-bold text-lg mb-4">Newsletter</h4>
              <p className="text-xs text-muted-foreground mb-4">Subscribe for updates and devotionals</p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs sm:max-w-none">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-muted border border-border/50 rounded-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-primary outline-none"
                />
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 h-9">Subscribe</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Biblical Financial Courses. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
