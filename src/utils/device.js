export const isMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    "android",
    "iphone",
    "ipad",
    "mobile",
    "windows phone",
    "blackberry",
    "nokia",
    "opera mini",
    "samsung",
    "sony",
    "htc",
    "lg",
    "moto",
    "nexus",
    "kindle",
    "silk",
    "midp",
    "j2me",
    "wap",
    "mobile",
  ];
  // 屏幕宽度小于768px也视为移动端
  const isSmallScreen = window.innerWidth < 768;
  // return isSmallScreen || mobileKeywords.some(keyword => userAgent.includes(keyword))
  return isSmallScreen;
};
