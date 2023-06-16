import { DefineCbs, getCallbacks, withCbs } from 'aspiration';
import { data, decorateCb, operation } from 'skandha';

export type GenericObjectT = any;

export class Addition<T = any> {
  static className = () => 'Addition';

  @data item?: T;
  @data parentId?: string;

  @operation @withCbs() add(args: {
    //
    values?: GenericObjectT;
  }) {
    const cbs = getCallbacks(this) as AdditionCbs<T>['add'];

    cbs.stageAdd && cbs.stageAdd();
    const newItem = args.values ?? cbs.createItem();
    return Promise.resolve(newItem).then(
      decorateCb((item: T) => {
        this.item = item;
        cbs.highlightNewItem && cbs.highlightNewItem();
        return item;
      })
    );
  }

  @operation @withCbs() confirm() {
    const cbs = getCallbacks(this) as AdditionCbs<T>['confirm'];

    const result = cbs.confirmAdd ? cbs.confirmAdd() : undefined;
    return Promise.resolve(result).then(
      decorateCb(() => {
        this._reset();
      })
    );
  }

  @operation @withCbs() cancel() {
    const cbs = getCallbacks(this) as AdditionCbs<T>['cancel'];

    if (this.item) {
      this._reset();
      cbs.unstageAdd && cbs.unstageAdd();
    }
  }

  @operation({ log: false }) _reset() {
    this.item = undefined;
    this.parentId = undefined;
  }
}

type Cbs<T> = {
  add: {
    stageAdd(): void;
    createItem(): T;
    highlightNewItem(): void;
  };
  cancel: {
    unstageAdd(): void;
  };
  confirm: {
    confirmAdd(): void;
  };
};

export type AdditionCbs<T = any> = DefineCbs<Addition<T>, Cbs<T>>;
