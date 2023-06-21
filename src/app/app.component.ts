import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FilePondOptions } from 'filepond';
import { PinturaEditorComponent } from '@pqina/angular-pintura';

// pintura
import {
  LocaleCore,
  LocaleCrop,
  LocaleFinetune,
  LocaleFilter,
  LocaleAnnotate,
  LocaleMarkupEditor,
} from '@pqina/pintura/locale/en_GB';

import {
  // editor
  createDefaultImageReader,
  createDefaultImageWriter,
  createDefaultShapePreprocessor,

  // plugins
  setPlugins,
  plugin_crop,
  plugin_finetune,
  plugin_finetune_defaults,
  plugin_filter,
  plugin_filter_defaults,
  plugin_annotate,
  markup_editor_defaults,

  // filepond
  legacyDataToImageState,
  openEditor,
  processImage,
  PinturaImageState,
} from '@pqina/pintura';

setPlugins(plugin_crop, plugin_finetune, plugin_filter, plugin_annotate);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [],
})
export class AppComponent {
  @ViewChild('inlineEditor') inlineEditor?: PinturaEditorComponent<any> = undefined;

  customWidth: number = 0;
  customHeight: number = 0;
  imageWidth: number = 0;
  imageHeight: number = 0;
    
    aspectRatios: any[] = [
      { ratio: 1, name: '1:1 - Square' },
      { ratio: 4 / 3, name: '4:3 - Standard' },
      { ratio: 16 / 9, name: '16:9 - Widescreen' },
      { ratio: 21 / 9, name: '21:9 - Ultra-Wide' },
      { ratio: 2.35, name: '2.35:1 - CinemaScope' },
      { ratio: 5 / 4, name: '5:4 - SXGA' },
      { ratio: 3 / 2, name: '3:2 - Classic' },
      { ratio: 18 / 9, name: '18:9 - FullView' },
      { ratio: 19.5 / 9, name: '19.5:9 - FullView Plus' },
      { ratio: 3, name: '3:1 - Panorama' },
      { ratio: 2, name: '2:1 - Univisium' },
      { ratio: 9 / 16, name: '9:16 - Portrait' },
      { ratio: 1.85, name: '1.85:1 - Standard widescreen cinematic aspect ratio' },
      { ratio: 16 / 10, name: '16:10 - Widescreen' },
      { ratio: 8 / 5, name: '8:5 - Widescreen' },
      { ratio: 2 / 3, name: '2:3 - Medium format photography' },
      { ratio: 7 / 5, name: '7:5 - Photography' },
      { ratio: 4 / 5, name: '4:5 - Portrait' }
    ];
        currentAspectRatioIndex: number = 0;
  constructor(private sanitizer: DomSanitizer) {}

  // editor generic state
  editorOptions: any = {
    imageReader: createDefaultImageReader(),
    imageWriter: createDefaultImageWriter(),
    shapePreprocessor: createDefaultShapePreprocessor(),
    ...plugin_finetune_defaults,
    ...plugin_filter_defaults,
    ...markup_editor_defaults,
    locale: {
      ...LocaleCore,
      ...LocaleCrop,
      ...LocaleFinetune,
      ...LocaleFilter,
      ...LocaleAnnotate,
      ...LocaleMarkupEditor,
    },
  };

  // inline
  inlineSrc: string = 'assets/image.jpeg';
  inlineResult?: string = undefined;
  inlineCropAspectRatio = 1;

handleInlineLoad($event: any) {
    console.log('inline load', $event);
    const imageElement = $event.imageState?.image;
    if (imageElement) {
      this.imageWidth = imageElement.width;
      this.imageHeight = imageElement.height;
    }
  }
  handleInlineProcess($event: any) {
    console.log('inline process', $event);
  
    const objectURL = URL.createObjectURL($event.dest);
    this.inlineResult = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL) as string;
  
    // Set custom crop rectangle if custom height and width are provided
    if (this.customHeight && this.customWidth) {
      const editorState: any | undefined = this.inlineEditor?.editor?.imageState;
      if (editorState) {
        const updatedImageState: any = {
          ...editorState,
          crop: {
            ...editorState.crop,
            rect: {
              x: 0,
              y: 0,
              width: this.customWidth,
              height: this.customHeight,
            },
          },
        };
        if (this.inlineEditor && this.inlineEditor.editor && this.inlineEditor.editor.imageState) {
          this.inlineEditor.editor.imageState = updatedImageState;
        }
              }
    }
  
    // Reset custom height and width values
    this.customHeight = 0;
    this.customWidth = 0;
  }
  

  // modal
  modalSrc: string = 'assets/image.jpeg';
  modalResult?: string = undefined;
  modalVisible: boolean = false;

  handleModalLoad($event: any) {
    console.log('modal load', $event);
  }

  handleModalProcess($event: any) {
    console.log('modal process', $event);
    const objectURL = URL.createObjectURL($event.dest);
    this.modalResult = this.sanitizer.bypassSecurityTrustResourceUrl(
      objectURL
    ) as string;
  }

  // overlay
  overlaySrc: string = 'assets/image.jpeg';
  overlayVisible: boolean = false;
  overlayResult?: string = undefined;
  overlayOptions: any = {
    imageReader: createDefaultImageReader(),
    imageWriter: createDefaultImageWriter(),
    locale: {
      ...LocaleCore,
      ...LocaleCrop,
    },
  };

  handleOverlayLoad($event: any) {
    console.log('overlay load', $event);
  }

  handleOverlayProcess($event: any) {
    const objectURL = URL.createObjectURL($event.dest);
    this.overlayResult = this.sanitizer.bypassSecurityTrustResourceUrl(
      objectURL
    ) as string;
    this.overlayOptions = {
      ...this.overlayOptions,
      imageState: $event.imageState,
    };

    this.overlayVisible = false;
  }

  // filepond
  pondOptions: FilePondOptions = {
    allowMultiple: true,
    labelIdle: 'Drop files here...',
    // FilePond Image Editor plugin properties
    imageEditor: {
      // Maps legacy data objects to new imageState objects (optional)
      legacyDataToImageState: legacyDataToImageState,

      // Used to create the editor (required)
      createEditor: openEditor,

      // Used for reading the image data. See JavaScript installation for details on the `imageReader` property (required)
      imageReader: [
        createDefaultImageReader,
        {
          // createDefaultImageReader options here
        },
      ],

      // Can leave out when not generating a preview thumbnail and/or output image (required)
      imageWriter: [
        createDefaultImageWriter,
        {
          // We'll resize images to fit a 512 × 512 square
          targetSize: {
            width: 512,
            height: 512,
          },
        },
      ],

      // Used to generate poster images, runs an invisible "headless" editor instance. (optional)
      imageProcessor: processImage,

      // Pintura Image Editor options
      editorOptions: {
        // The markup editor default options, tools, shape style controls
        ...markup_editor_defaults,

        // The finetune util controls
        ...plugin_finetune_defaults,

        // This handles complex shapes like arrows / frames
        shapePreprocessor: createDefaultShapePreprocessor(),

        // This will set a square crop aspect ratio
        imageCropAspectRatio: 1,

        locale: {
          ...LocaleCore,
          ...LocaleCrop,
          ...LocaleFinetune,
          ...LocaleFilter,
          ...LocaleAnnotate,
          ...LocaleMarkupEditor,
        },
        imageResize: {
          // Set the maximum width and height for resizing
          maxWidth: 800,
          maxHeight: 800,
        },
      },
    },
  };

  pondFiles: FilePondOptions['files'] = ['assets/image.jpeg'];

  pondHandleInit() {
    console.log('FilePond has initialised');
  }

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
  }

  // pondHandlePrepareFile(event: any) {
  //   const file = event.file;
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     this.inlineSrc = e.target?.result as string;
  //     this.currentAspectRatioIndex = 0; // Reset the aspect ratio to the first one
  //   };
  //   reader.readAsDataURL(file.file);
  // }
  pondHandlePrepareFile(event: any) {
    const file = event.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.inlineSrc = e.target?.result as string;
      this.currentAspectRatioIndex = 0; // Reset the aspect ratio to the first one
  
      if (this.customWidth && this.customHeight) {
        // Calculate the maximum width and height based on the custom size
        const aspectRatio = this.customWidth / this.customHeight;
        const maxWidth = aspectRatio >= 1 ? this.customWidth : this.customHeight;
        const maxHeight = aspectRatio >= 1 ? this.customHeight : this.customWidth;
  
        // Update the image resize options
        this.editorOptions.imageResize.maxWidth = maxWidth;
        this.editorOptions.imageResize.maxHeight = maxHeight;
      } else {
        // Reset the image resize options to their default values
        this.editorOptions.imageResize.maxWidth = 800;
        this.editorOptions.imageResize.maxHeight = 800;
      }
    };
    reader.readAsDataURL(file.file);
  }
  
  

  pondHandleActivateFile(event: any) {
    console.log('A file was activated', event);
  }
  get currentAspectRatio(): number {
    return this.aspectRatios[this.currentAspectRatioIndex].ratio;
  }
  
  toggleAspectRatio(): void {
    this.currentAspectRatioIndex = (this.currentAspectRatioIndex + 1) % this.aspectRatios.length;
  }
  
  getAspectRatioText(): string {
    const currentAspectRatio = this.aspectRatios[this.currentAspectRatioIndex];
    return `Current Aspect Ratio: ${currentAspectRatio.name}`;
  }

  updateCustomSize(): void {
    if (
      this.customHeight &&
      this.customWidth &&
      this.inlineEditor &&
      this.inlineEditor.editor &&
      this.inlineEditor.editor.imageState &&
      this.inlineEditor.editor.imageState.crop
    ) {
      const crop = this.inlineEditor.editor.imageState.crop;
      const x = crop.x !== undefined ? crop.x : 0;
      const y = crop.y !== undefined ? crop.y : 0;
  
      const updatedImageState: PinturaImageState = {
        ...this.inlineEditor.editor.imageState,
        crop: {
          x,
          y,
          width: this.customWidth,
          height: this.customHeight,
        },
      };
  
      this.inlineEditor.editor.imageState = updatedImageState;
    }
}
}