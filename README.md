# jQuery Table4Panes 1.1.0
Split the table into 4 panes with only JavaScript without changing the HTML.

## Demo
Refer the following:
* demo-jquery-table4panes.html
* demo-jquery-table4panes_span.html

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

Call the following to fix it in 4 columns and 3 rows and display it on the entire screen.

```js
$(function(){
    $("#demo-table").table4panes(4,3,{"display-method":"flex", "width":"100%", "height":"100%", "fit":true});
});
```

## Settings(3rd parameter)

### "display-method"
The "display-method" option can be one of the following CSS side-by-side methods:
* "inline-block"
* "table-cell"
* "flex"
* "float"

### "fit"
If it is true, the bottom right pane fits the parent node.

### Size
The size of each pane is specified the following:
* The overall size is specified by "height" and "width".
* Height of each pane is specified by "top-height" and "bottom-height".
* Width of each pane is specified by "left-width" and "right-width".

### "fix-width-rows"
The option specifies the number of rows used to fix the column width.
The default value is "row_num + 1".

### "callbacks"
The option specifies event/function/data for the selectors and specifies callbacks for each event.

### "css"
This option specifies the CSS for the selectors.

### "prefix"
The option changes the class name prefix from the default "table4panes".

## License
Copyright &copy; ASAI Etsuhisa<br>
Licensed under the MIT license.

