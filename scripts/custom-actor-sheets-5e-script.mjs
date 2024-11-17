/*
! Custom Actor Sheets for DnD5e v4+
! by NonchalantWombat
*/

class HueRotateApp extends Application {
  constructor(actor) {
    super();
    this.actor = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/dnd5e-custom-actor-sheets/templates/hue-rotate.html",
      title: "Adjust Hue Rotation and Saturation",
      width: 400,
    });
  }

  activateListeners(html) {
    const hueSlider = html.find("#hue-slider");
    const saturationSlider = html.find("#saturation-slider");
    const backgroundImageSelect = html.find("#background-image-select");

    const hueValueDisplay = html.find("#hue-value");
    const saturationValueDisplay = html.find("#saturation-value");

    // Event listener for Hue slider
    hueSlider.on("input", (event) => {
      const hueValue = event.target.value;
      hueValueDisplay.text(`${hueValue}°`);
      this.applyFilters();
    });

    // Event listener for Saturation slider
    saturationSlider.on("input", (event) => {
      const saturationValue = event.target.value;
      saturationValueDisplay.text(`${saturationValue}%`);
      this.applyFilters();
    });

    // Event listener for Background Image selection
    backgroundImageSelect.on("change", (event) => {
      this.applyFilters();
    });

    // Get saved settings
    const customStyles = this.actor.getFlag('dnd5e-custom-actor-sheets', 'customStyles') || {};

    // Set initial values
    hueSlider.val(customStyles.hueValue || 0);
    saturationSlider.val(customStyles.saturationValue || 100);
    backgroundImageSelect.val(customStyles.backgroundImage || 'image1.jpg');

    // Update displayed values
    hueValueDisplay.text(`${customStyles.hueValue || 0}°`);
    saturationValueDisplay.text(`${customStyles.saturationValue || 100}%`);

    // Apply the filters with the initial values
    this.applyFilters();
  }

  applyFilters(hueValue, saturationValue, backgroundImage) {
    const characterSheet = $(this.actor.sheet.element);

    if (!characterSheet || characterSheet.length === 0) {
      console.error("Character sheet element not found for hue rotation.");
      return;
    }

    // If values are not provided, get them from the UI or actor's flags
    if (hueValue === undefined || saturationValue === undefined || backgroundImage === undefined) {
      const html = this.element;
      if (html && html.length) {
        hueValue = html.find("#hue-slider").val();
        saturationValue = html.find("#saturation-slider").val();
        backgroundImage = html.find("#background-image-select").val();
      } else {
        // Get values from actor's flags
        const customStyles = this.actor.getFlag('dnd5e-custom-actor-sheets', 'customStyles') || {};
        hueValue = customStyles.hueValue || 0;
        saturationValue = customStyles.saturationValue || 100;
        backgroundImage = customStyles.backgroundImage || 'image1.jpg';
      }
    }

    // Assign a unique ID to the actor sheet element
    const uniqueSheetId = `actor-sheet-${this.actor.id}`;
    characterSheet.attr('id', uniqueSheetId);

    // Remove any existing style element for this actor sheet to avoid duplicates
    $(`#style-${uniqueSheetId}`).remove();

    // Create a new style element
    const style = document.createElement('style');
    style.id = `style-${uniqueSheetId}`;
    style.type = 'text/css';

    // Define the CSS rule
    const css = `
      #${uniqueSheetId} .window-content::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 260px;
        border-radius: 5px 5px 0 0;
        opacity: 1;
        background: url("modules/dnd5e-custom-actor-sheets/images/${backgroundImage}") no-repeat top center / cover;
        filter: hue-rotate(${hueValue}deg) saturate(${saturationValue}%);
        -webkit-mask-image: linear-gradient(to bottom, black, transparent);
        mask-image: linear-gradient(to bottom, black, transparent);
      }
    `;

    style.innerHTML = css;

    // Append the style element to the document head
    document.head.appendChild(style);

    console.log(`Custom styles applied for actor ${this.actor.id}`);

    // Save the settings to the actor's flags if we have the UI open
    if (this.element && this.element.length) {
      this.actor.setFlag('dnd5e-custom-actor-sheets', 'customStyles', {
        hueValue,
        saturationValue,
        backgroundImage
      });
    }
  }
}

// Add the SVG icon to the actor sheet and open the hue rotation UI
Hooks.on("renderActorSheet", (app, html, data) => {
  // Path to your SVG icon
  const svgIconPath = "modules/dnd5e-custom-actor-sheets/images/paint-bucket.svg";

  // Create an img element for the SVG icon
  const icon = $(`<img src="${svgIconPath}" class="hue-rotate-icon">`);

  // Optional: Wrap the icon in a container if needed
  // const iconContainer = $('<div class="hue-rotate-icon-container"></div>').append(icon);

  // Append the icon to the actor sheet header
  html.find('.window-header .window-title').after(icon);

  // Add click event to open the hue rotation UI
  icon.on("click", () => {
    console.log("Opening HueRotateApp for actor:", app.object);
    new HueRotateApp(app.object).render(true);
  });

  // Apply saved styles
  const customStyles = app.object.getFlag('dnd5e-custom-actor-sheets', 'customStyles');
  if (customStyles) {
    const hueRotateApp = new HueRotateApp(app.object);
    hueRotateApp.applyFilters(); // Apply filters using saved values
  }
});