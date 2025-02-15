import WelcomeContainer from '@/components/home/WelcomeContainer'
import Wallpaper from '@/components/ui/Wallpaper';

export default function Home() {
  return (
    <main className="relative flex-grow min-h-0">
      {/* Main content */}
      <div className="relative z-20 h-full">
        <WelcomeContainer />
      </div>
    </main>
  );
}
