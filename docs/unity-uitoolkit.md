# Unity UI Toolkit Reference

Source: Unity Manual / Script Reference (Unity 6.x)  
Namespace: `UnityEngine.UIElements`

---

## Overview

UI Toolkit is Unity's retained-mode UI system built on a visual tree of `VisualElement` nodes styled with USS (Unity Style Sheets). BanterVR's UI panel system uses UI Toolkit under the hood, so USS properties and element behaviour described here apply directly.

---

## USS Supported Properties

### Dimensions
| Property | Notes |
|---|---|
| `width`, `height` | Length or `auto` |
| `min-width`, `min-height` | |
| `max-width`, `max-height` | |
| `aspect-ratio` | Ratio value or `auto` |

### Spacing
| Property | Notes |
|---|---|
| `margin`, `margin-left`, `margin-top`, `margin-right`, `margin-bottom` | |
| `padding`, `padding-left`, `padding-top`, `padding-right`, `padding-bottom` | |
| `border-width`, `border-left-width`, `border-top-width`, `border-right-width`, `border-bottom-width` | |

### Flex Layout
| Property | Notes |
|---|---|
| `flex`, `flex-grow`, `flex-shrink`, `flex-basis` | |
| `flex-direction` | `row` \| `row-reverse` \| `column` \| `column-reverse` |
| `flex-wrap` | `nowrap` \| `wrap` \| `wrap-reverse` |
| `align-items` | `auto` \| `flex-start` \| `flex-end` \| `center` \| `stretch` |
| `align-content` | |
| `align-self` | |
| `justify-content` | `flex-start` \| `flex-end` \| `center` \| `space-between` \| `space-around` |

### Positioning
| Property | Notes |
|---|---|
| `position` | `absolute` \| `relative` |
| `left`, `top`, `right`, `bottom` | Length or `auto` |

### Background
| Property | Notes |
|---|---|
| `background-color` | |
| `background-image` | |
| `-unity-background-scale-mode` | |
| `-unity-background-image-tint-color` | |
| `-unity-slice-left/top/right/bottom/scale/type` | 9-slice |

### Borders
| Property | Notes |
|---|---|
| `border-color`, `border-left-color`, `border-top-color`, `border-right-color`, `border-bottom-color` | |
| `border-radius`, `border-top-left-radius`, `border-top-right-radius`, `border-bottom-left-radius`, `border-bottom-right-radius` | |

### Text
| Property | Notes |
|---|---|
| `color` | Inherits to child TextElements |
| `font-size` | |
| `-unity-font` | Font asset resource |
| `-unity-font-definition` | |
| `-unity-font-style` | `normal` \| `bold` \| `italic` \| `bold-and-italic` |
| `-unity-text-align` | `upper-left` \| `upper-center` \| `upper-right` \| `middle-left` \| `middle-center` \| `middle-right` \| `lower-left` \| `lower-center` \| `lower-right` |
| `white-space` | `normal` \| `nowrap` \| `pre` \| `pre-wrap` |
| `text-overflow` | `clip` \| `ellipsis` |
| `-unity-text-overflow-position` | `start` \| `middle` \| `end` |
| `letter-spacing`, `word-spacing` | |
| `text-shadow` | |
| `-unity-text-outline`, `-unity-text-outline-width`, `-unity-text-outline-color` | |
| `-unity-text-generator` | `standard` \| `advanced` |
| `-unity-text-auto-size` | `none` \| `best-fit <min> <max>` |
| `-unity-paragraph-spacing` | |

### Appearance
| Property | Notes |
|---|---|
| `opacity` | `<number>` 0–1 |
| `visibility` | `visible` \| `hidden` |
| `display` | `flex` \| `none` |
| `overflow` | `hidden` \| `visible` |
| `cursor` | Keyword or custom resource |
| `-unity-material` | Custom material |
| `all` | `initial` — resets all properties |

---

## VisualElement

**Class:** `VisualElement`  
**Base:** `Focusable`

The foundational building block. Every element in the visual tree is a VisualElement or subclass. Can contain child elements.

```csharp
var container = new VisualElement();
container.style.flexDirection = FlexDirection.Row;
container.style.backgroundColor = Color.blue;
container.Add(new Label("Hello"));
```

**Key attributes:** `name`, `enabled`, `picking-mode`, `style`, `view-data-key`  
**USS class:** `.unity-disabled`

---

## Label

**Class:** `Label`  
**Base:** `TextElement` → `VisualElement`

Displays text. Inherits all TextElement properties.

```csharp
var label = new Label("Hello World");
label.style.fontSize = 14;
label.style.unityFontStyleAndWeight = FontStyle.Bold;
label.style.unityTextAlign = TextAnchor.MiddleCenter;
label.style.color = Color.white;
```

**Key attributes:** `text`, `enable-rich-text`, `parse-escape-sequences`, `selectable`  
**USS classes:** `.unity-label`, `.unity-text-element`

---

## Button

**Class:** `Button`  
**Base:** `TextElement` → `VisualElement`

Clickable element. Because Button extends TextElement, it has a built-in `text` property rendered by an internal Label sub-element. The `color` property on the Button cascades to this internal label.

```csharp
var button = new Button(() => Debug.Log("clicked")) { text = "Click me" };
```

**Icon support:** Add a Texture/Sprite via `icon-image` attribute or `iconImage` property. Icon position is controlled via `flex-direction` on the button:
- `row-reverse` — icon right of text
- `column` — icon above text
- `column-reverse` — icon below text

**Key attributes:** `text`, `icon-image`  
**USS classes:** `.unity-button`, `.unity-button--with-icon`, `.unity-button--with-icon-only`

> **Note on text colour:** `color` on Button should cascade to its internal Label. If it does not (due to theme overrides), target the sub-element explicitly via USS child selector: `Button > Label { color: white; }`. As an alternative, place a UILabel child inside the Button for full style control.

---

## Toggle

**Class:** `Toggle`  
**Base:** `BaseBoolField` → `VisualElement`

Checkbox-style boolean control. Contains an image (checkmark) and a label.

```csharp
Toggle myToggle = new Toggle("Enable feature");
myToggle.RegisterCallback<ChangeEvent<bool>>(evt => Debug.Log(evt.newValue));
```

**Key attributes:** `label`, `value`, `toggle-on-label-click`, `binding-path`  
**USS classes:** `.unity-toggle`, `.unity-toggle__input`, `.unity-toggle__checkmark`

Customise the checkmark appearance by targeting `.unity-toggle__checkmark` with `background-image`.

---

## Slider

**Class:** `Slider`  
**Base:** `BaseSlider<float>` → `VisualElement`

Floating-point value selector via draggable thumb.

```csharp
var slider = new Slider();
slider.lowValue  = 0f;
slider.highValue = 100f;
slider.value     = 50f;
slider.direction = SliderDirection.Horizontal;
```

**Key attributes:** `value`, `low-value`, `high-value`, `direction`, `page-size`, `show-input-field`, `label`  
**USS classes:** `.unity-slider`, `.unity-base-slider__dragger`, `.unity-base-slider__tracker`

**Keyboard:** Arrow keys ±1/100 of range; +Shift ±1/10; Home/End jump to extremes.

---

## ScrollView

**Class:** `ScrollView`  
**Base:** `VisualElement`

Scrollable container. Children are added to an internal `#unity-content-container`, not to the ScrollView itself.

```csharp
var sv = new ScrollView();
sv.Add(new Label("Item 1"));
// Scroll to bottom:
sv.scrollOffset = new Vector2(0, sv.verticalScroller.highValue);
// Wrap children horizontally:
sv.contentContainer.style.flexDirection = FlexDirection.Row;
sv.contentContainer.style.flexWrap      = Wrap.Wrap;
```

**Key attributes:** scroll mode (vertical/horizontal/both), `horizontal-page-size`, `vertical-page-size`, `mouse-wheel-scroll-size`

---

## USS Selectors

| Type | Example | Matches |
|---|---|---|
| Type | `Button` | All Button elements |
| Class | `.unity-button` | Elements with that USS class |
| Name | `#myButton` | Element with `name="myButton"` |
| Universal | `*` | Any element |
| Descendant | `ScrollView Label` | Label anywhere inside ScrollView |
| Child | `Button > Label` | Label that is a direct child of Button |
| Pseudo-class | `Button:hover` | Button in hover state |

**Common pseudo-classes:** `:hover`, `:active`, `:focus`, `:disabled`, `:checked`, `:enabled`

---

## Inline Style vs USS

Inline styles (set via `element.style.*` in C#) have the **highest specificity** and override any USS stylesheet rule, including Unity's built-in theme. Use inline styles via BanterVR's `SetStyles()` / `SetStyle()` calls to guarantee overrides.
