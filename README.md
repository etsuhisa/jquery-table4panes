# jQuery Table4Panes 1.0.0
Split the table to four panes.

## Demo
Refer the following:
* demo-jquery-table4panes.html

## Usage

Include jQuery and the plugin on a page.

```html
<script src="jquery.min.js"></script>
<script src="jquery-table4panes.min.js"></script>
```

Call the table4panes function for the table to split.
Specify the number of columns in the first parameter and the number of rows in the second parameter.
The settings (ex. display size, display method) specify in the third parameter.

```js
$.fn.table4panes(col_num, row_num, settings)
```

## Example

Fixed in 4 columns and 3 rows, displayed on the entire screen.

```js
$(function(){
    $("#demo-table").table4panes(4,3,{"display-method":"flex", "width":"100%", "height":"100%", "fit":true});
});
```

## Settings

### "display-method"
The "display-method" option can be one of the following values.
* "inline-block"
* "table-cell"
* "flex"
* "float"

### "fit"
If it is true, fit the bottom right pane fits the parent node.

### Size
The size of each pane is specified the following:
* The overall size is specified by "height" and "width".
* Height of each pane is specified by "top-height" and "bottom-height".
* Width of each pane is specified by "left-width" and "right-width".

### "callbacks"
The callbacks for the events are specified by "callbacks" with event/function/data for selectors.

### "css"
The CSS maps for selectors are specified by "css".

### "prefix"
The class name prefix can be changed from the default "table4panes" by "prefix".

## License
Copyright &copy; ASAI Etsuhisa<br>
Licensed under the MIT license.

