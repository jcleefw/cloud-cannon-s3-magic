class Deleter {

  constructor(assetList) {
    this.assetList = assetList
    this.targetElement = ''

    document.addEventListener('click', this.onDeleteButtonClick.bind(this))
  }

  onDeleteButtonClick(e) {
    if(e.target.src && e.target.src.includes('trash')) {
      this.confirmDeletion(e.target)
    }
  }

  confirmDeletion(targetImage) {
    let confirmation = confirm('Are you sure you want to delete this image?')

    if(confirmation) {
      this.targetElement = targetImage.parentElement
      this.deleteImage(targetImage.parentElement.getAttribute('data-delete-path'))
    }
  }

  deleteImage(imagePath) {
    const promises = []
    const key = imagePath.split(EXT_SETTINGS.outputBaseUrl)
    let filename = key[key.length-1]

    promises.push(App.s3Service.delete(filename))
    const assetStatusService = new AssetStatusService()
    Promise.all(promises)
      .then(() => {
        assetStatusService.showSuccess('Delete successful!')
        this.assetList.fetchAssets()
      })
      .catch(() => {
        assetStatusService.showError('Oops, something wrong with image deletion.')
      })
  }

}
