export function HeroVideo() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/80 aspect-video"
      dangerouslySetInnerHTML={{
        __html: `<video
          autoplay
          muted
          loop
          playsinline
          webkit-playsinline
          preload="auto"
          poster="/confidance-hero-poster.jpg"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
        ><source src="/ConfidanceHero.mp4" type="video/mp4"></video>
        <script>
          (function(){
            var v=document.currentScript.parentElement.querySelector('video');
            if(v){v.muted=true;setTimeout(function(){v.play().catch(function(){})},100);}
          })();
        </script>`,
      }}
    />
  )
}
