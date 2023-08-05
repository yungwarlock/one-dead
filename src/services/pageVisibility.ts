
export enum PageVisibilityState {
  HIDDEN = "hidden",
  VISIBLE = "visible",
}

type Unsubscribe = () => void;

export default class PageVisibilityService {
  private visibilityChangeListeners: Array<(state: PageVisibilityState) => void> = [];

  constructor() {
    this.dispose = this.dispose.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.notifyListeners = this.notifyListeners.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.addVisibilityChangeListener = this.addVisibilityChangeListener.bind(this);

    window.addEventListener("blur", this.handleBlur, false);
    window.addEventListener("focus", this.handleFocus, false);
    document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
  }

  public dispose(): void {
    this.visibilityChangeListeners = [];
    window.removeEventListener("blur", this.handleBlur, false);
    window.removeEventListener("focus", this.handleFocus, false);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange, false);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // console.log("Tab is in the background or minimized");
      this.notifyListeners(PageVisibilityState.HIDDEN);
    } else {
      // console.log("Tab is in the foreground or maximized");
      this.notifyListeners(PageVisibilityState.VISIBLE);
    }
  }

  private handleBlur(): void {
    // console.log("Window is blurred");
    this.notifyListeners(PageVisibilityState.HIDDEN);
  }

  private handleFocus(): void {
    // console.log("Window is focused");
    this.notifyListeners(PageVisibilityState.VISIBLE);
  }

  public addVisibilityChangeListener(listener: (state: PageVisibilityState) => void): Unsubscribe {
    this.visibilityChangeListeners.push(listener);
    return () => {
      this.visibilityChangeListeners = this
        .visibilityChangeListeners
        .filter((item) => item !== listener);
    };
  }

  private notifyListeners(state: PageVisibilityState): void {
    this.visibilityChangeListeners.forEach((listener) => listener(state));
  }

}
