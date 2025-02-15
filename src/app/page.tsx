import WelcomeContainer from '@/components/home/WelcomeContainer'
import Wallpaper from '@/components/ui/Wallpaper';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Main content */}
      <div className="relative z-20">
        <WelcomeContainer />
      </div>
    </main>
  );
}
