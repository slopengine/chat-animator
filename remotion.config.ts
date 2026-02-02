import { Config } from "@remotion/cli/config";
import webpack from "webpack";

Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);

// Studio settings  
Config.setPort(4200);
Config.setShouldOpenBrowser(true);

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
