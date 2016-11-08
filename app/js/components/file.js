class File {
  constructor(file) {
    this.s3BaseUrl = App.s3Service.s3BaseUrl()
    this.file = file
    this.s3Url = this.buildS3Url()
  }

  buildS3Url() {
    return `${this.s3BaseUrl}/${this.file.Key}`
  }

  render() {
    return `
      <div class="magic-bar__asset-wrapper">
        <div class="pdf-placeholder">
          ${this.buildS3Url().split('/').pop()}
        </div>
        <button class="ccs3-btn ccs3-btn--icon btn-delete-asset tooltip-bottom" data-delete-path="${this.s3Url}">
          <img src="${this.s3BaseUrl}/images/assets/trash.svg" />
        </button>
        <button data-ccs3-tooltip="copied" class="ccs3-btn ccs3-btn--icon btn-copy-asset tooltip-bottom" data-clipboard-text="${this.s3Url}">
          <img src="${this.s3BaseUrl}/images/assets/clipboard.svg" />
        </button>
      </div>
    `
  }

}
