/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Listener {
  off: () => void;
}

// TODO: Needs documentation
export default abstract class ChangeNotifier<T = null> {


  protected readonly listenerId = this.constructor.name;
  private static listeners: Record<string, Array<(v?: any) => void>> = {};

  protected notifyListeners(v?: T) {
    this.checkListenersArray(this.listenerId);
    for (const listener of ChangeNotifier.listeners[this.listenerId]) {
      listener(v);
    }
  }

  public watch(listener: (v?: T) => void): Listener {
    this.addEventListener(listener);
    const that = this;
    return {
      off() {
        that.removeEventListener(listener);
      },
    };
  }

  private checkListenersArray(listenerId: string) {
    if (!Array.isArray(ChangeNotifier.listeners[listenerId])) {
      ChangeNotifier.listeners[listenerId] = [];
    }
  }

  private addEventListener(listener: (v?: T) => void): Listener {
    this.checkListenersArray(this.listenerId);

    ChangeNotifier.listeners[this.listenerId].push(listener);
    const that = this;
    return {
      off() {
        that.removeEventListener(listener);
      }
    };
  }

  private removeEventListener(listener: (v?: T) => void) {
    const res = ChangeNotifier.listeners[this.listenerId].filter(item => item !== listener);
    ChangeNotifier.listeners[this.listenerId] = res;
  }
}
