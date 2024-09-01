import { CallbackMap, withCbs } from 'aspiration';
import { data, operation, operationExt } from 'skandha';

export class Edit {
  static className = () => 'Edit';

  callbackMap = {} as CallbackMap<{
    save: {
      saveItem: () => any;
    };
    cancel?: {
      onCancel?: () => void;
    };
    enable?: {
      onEnable?: () => void;
    };
  }>;

  @data isEditing: boolean = false;
  @data isSaving: boolean = false;

  @operation reset() {
    this.isEditing = false;
  }

  @operationExt({ log: false }) setIsSaving(isSaving: boolean) {
    this.isSaving = isSaving;
  }

  @operation save(args: { values: any }) {
    return withCbs(this.callbackMap, 'save', args, (cbs) => {
      this.setIsSaving(true);
      return Promise.resolve(cbs.saveItem()).then((savedObj: any) => {
        this.reset();
        this.setIsSaving(false);
        return savedObj;
      });
    });
  }

  @operation cancel() {
    return withCbs(this.callbackMap, 'cancel', {}, (cbs) => {
      if (this.isEditing) {
        this.reset();
        cbs?.onCancel && cbs.onCancel();
      }
    });
  }

  @operation enable() {
    return withCbs(this.callbackMap, 'enable', {}, (cbs) => {
      if (!this.isEditing) {
        this.isEditing = true;
        cbs?.onEnable && cbs.onEnable();
      }
    });
  }
}
