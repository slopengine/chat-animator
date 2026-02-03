import { Config } from "@remotion/cli/config";
import webpack from "webpack";

// ============ Render Quality Settings ============
// Use PNG for lossless intermediate frames (higher quality)
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);

// Codec settings for high quality MP4
Config.setCodec("h264");
// CRF 18 = near-lossless quality (lower = better, 0-51 scale)
Config.setCrf(18);
// High profile for better compression at high quality
Config.setX264Preset("slow");
// Pixel format for compatibility
Config.setPixelFormat("yuv420p");

// ============ Studio Settings ============
// Port is set via CLI (--port 4200) to avoid conflicts during rendering
Config.setShouldOpenBrowser(true);
// Use different port for render server to avoid conflicts with Studio
Config.setRendererPort(4201);

// Force sidebars open by default via webpack banner
Config.overrideWebpackConfig((config) => {
  const initCode = `
(function(){
  if(typeof localStorage!=='undefined'){
    if(!localStorage.getItem('remotion.sidebarRightCollapsing')){
      localStorage.setItem('remotion.sidebarRightCollapsing','expanded');
    }
    if(!localStorage.getItem('remotion.sidebarCollapsing')){
      localStorage.setItem('remotion.sidebarCollapsing','expanded');
    }
  }
})();
`;
  
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      new webpack.BannerPlugin({
        banner: initCode,
        raw: true,
        entryOnly: false,
      }),
    ],
  };
});
