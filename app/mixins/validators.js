import { translationMacro as t } from "ember-i18n";

export const fileValidator = Ember.Mixin.create({
  i18n: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.validFiles = [];
  },

  fileTypeMessage: t("errors.validation.file.file_type"),
  imageFormatMessage: t("errors.validation.file.image_format"),
  sizeLimitMessage: Ember.computed("i18n.locale", "mode", function() {
    return this.get("i18n").t("errors.validation.file.size", {
      limit: this.get("conditions")[this.get("mode")]["maxFileSize"] / 1000,
    });
  }),

  conditions: {
    singleUpload: {
      maxFileSize: 700000,
      // TODO: handle multiple uploads for File Manager feature
      maxUploadable: 1
    }
  },

  validateFile(file, options) {
    var imageOnly = options.imageOnly;
    var {maxFileSize, maxUploadable} = this.conditions[this.get('mode')];

    if (Ember.isEmpty(file)) {return;}

    if (imageOnly && !file.type.match(/image/)) {
      this.set('errors.picture', this.get("fileTypeMessage").toString());
      file.invalid = true;
    } else if (file.type.match(/image/) && !(file.type.match(/(jpeg|png|gif)/))) {
      this.set('errors.picture', this.get("imageFormatMessage").toString());
      file.invalid = true;
    } else if (file.size > maxFileSize) {
      this.set('errors.picture', this.get('sizeLimitMessage').toString());
      file.invalid = true;
    }

    if (!file.invalid) {
      if (maxUploadable === 1) {
        this.validFiles[0] = file;
      } else {
        this.validFiles.push(file);
      }
    }

  }
});
