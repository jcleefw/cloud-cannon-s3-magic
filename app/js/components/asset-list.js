class AssetList {
  constructor() {
    this.assetListElem = document.querySelector('#asset-list')
    this.assets = []
    this.continuationToken = null
    this.maxCount = 20
    this.fetchAssets()
    document.addEventListener('click', this.onAssetsListClick.bind(this.assetListElem))
  }

  fetchAssets() {
    App.s3Service.loadImages()
      .then(this.onAssetsLoaded.bind(this))
  }

  onAssetsLoaded(assets) {
    this.assets = assets
    this.assets = this.filterValidAssets()
    this.render(this.assets)
    this.setUpCopyAssetButton()
    this.setUpDeleteAssetButton()
  }

  filterValidAssets() {
    const fileService = new FileService()
    let assets = this.assets.filter(asset => {
      if (fileService.isValidFile(asset.Key)) return true
    })
    return this.sortAssetsByDate(assets)
  }

  sortAssetsByDate(assets) {
    return assets.slice(0).sort(this.customDateSort)
  }

  customDateSort(a, b) {
    if (a.LastModified > b.LastModified) {
      return -1
    }
    else if (a.LastModified < b.LastModified) {
      return 1
    }
    else {
      return 0
    }
  }

  onAssetsListClick(e) {
    const imagePath = e.target.dataset.path
    if(imagePath == 'undefined') return false

    if(imagePath)
      new Image(imagePath).addImageOnClick()
  }

  render(assets) {
    const truncatedAssetList = assets.slice(0, this.maxCount)
    const fileService = new FileService()

    this.assetListElem.innerHTML = truncatedAssetList.map(asset => {
      if (fileService.isImage(asset.Key)) {
        return new Image(asset).render()
      } else if (fileService.isPdf(asset.Key)) {
        return new File(asset).render()
      }
    }).join('')
  }

  setUpCopyAssetButton() {
    const clipboard = new Clipboard('.btn-copy-asset', {
      text: function(trigger) {
        return trigger.getAttribute('data-clipboard-text');
      }
    })

    clipboard.on('success', e => {
      e.trigger.addClass('active')
      window.setTimeout(function() {
        e.trigger.removeClass('active')
      }, 750)
    })
  }

  setUpDeleteAssetButton() {
    const clipboard = new Clipboard('.btn-delete-asset', {
      text: function(trigger) {
        return trigger.getAttribute('data-delete-path');
      }
    })

    clipboard.on('success', e => {
      let confirmation = confirm('Are you sure you want to delete this image?')

      const promises = []
      const key = e.text.split(EXT_SETTINGS.outputBaseUrl)
      let filename = key[key.length-1]

      if(confirmation) {
        promises.push(App.s3Service.delete(filename))
      } else {
        const statusService = new AssetStatusService()

        statusService.showError(`Oops something wrong for ${filename} deletion !`)
        this.submitUploadElem.removeClass('loading')
      }
      const assetStatusService = new AssetStatusService()
      Promise.all(promises)
        .then(this.onDeleteSuccess.bind(this))
        .catch(assetStatusService.showError)
    })
  }

  onDeleteSuccess() {
    const statusService = new AssetStatusService()
    statusService.showSuccess('Delete successful!')
    this.fetchAssets()
  }
}
