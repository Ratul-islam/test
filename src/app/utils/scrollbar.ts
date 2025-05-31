export const disableScroll = () => {
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = `${scrollBarWidth}px`;
};

export const enableScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};
