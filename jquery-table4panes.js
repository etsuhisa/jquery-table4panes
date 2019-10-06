/**
 * jquery-table4panes 0.2.0 - jQuery plugin to split the table to four panes.
 *
 * Copyright (c) 2019 ASAI Etsuhisa
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 *
 * [Usage]
 * $.fn.table4panes(col_num, row_num, settings)
 * Split the table to four panes.
 *
 * @param this     (in) table node to split to the panes
 * @param col_num  (in) number of columns to fix
 * @param row_num  (in) number of rows to fix
 * @param settings (in) settings for table4panes
 *   "display-method": ("inline-block"|"table-cell"|"flex"|"float") - Select the method.
 *   "fit": (true|flase) - If true, fit the bottom right pane fits the parent node.
 *   ("height"|"top-height"|"bottom-height"|"width"|"left-width"|"right-width"): size - Set the size.
 *   "fix-width-rows": [lower,upper] or "dummy" - Fix the width of columns
 *                     with the specified numbers of lower/upper row.
 *   "callbacks": {"selector1": [ 
 *                  {"event":"event1-a", "func":"func1-a", "data":"data1-a"},
 *                  {"event":"event1-b", "func":"func1-b", "data":"data1-b"}, ...  ],
 *                 "selector2": {"event":"event2", "func":"func2", "data":"data2"},
 *                 ... } - Set the callbacks by arrays or maps for each selector.
 *   "css": {"selector1": "css-map1", "selector2": "css-map2", ... } - Map the css.
 *   "prefix": "prefix" - Set the prefix for the class name.
 * @return the top level div node.
 *
 * From:
 * +- table id --------------------------+
 * | (col_num + ***) x (row_num + ***)   |
 * |                                     |
 * | # with or without thead/tbody/th/td |
 * +-------------------------------------+
 *
 * To:
 * +- div table4panes -------------------------------------------+
 * |      #id-table4panes                                        |
 * |      .prefix                                                |
 * | +- div left ----------------+ +- div right ---------------+ |
 * | |      #id-left             | |      #id-right            | |
 * | |      .prefix-left         | |      .prefix-right        | |
 * | | +- div top-left --------+ | | +- div top-right -------+ | |
 * | | |      #id-top-left     | | | |      #id-top-right    | | |
 * | | |      .prefix-top      | | | |      .prefix-top      | | |
 * | | |      .pane            | | | |      .pane            | | |
 * | | | +- table -----------+ | | | | +- table -----------+ | | |
 * | | | | col_num x row_num | | | | | | *** x row_num     | | | |
 * | | | +-------------------+ | | | | +-------------------+ | | |
 * | | +-----------------------+ | | +-----------------------+ | |
 * | | +- div bottom-left -----+ | | +- div bottom-right--- -+ | |
 * | | |      #id-bottom-left  | | | |      #id-bottom-right | | |
 * | | |      .prefix-bottom   | | | |      .prefix-bottom   | | |
 * | | |      .pane            | | | |      .pane            | | |
 * | | | +- table -----------+ | | | | +- table id --------+ | | |
 * | | | | col_num x ***     | | | | | | *** x ***         | | | |
 * | | | +-------------------+ | | | | +-------------------+ | | |
 * | | +-----------------------+ | | +-----------------------+ | |
 * | +---------------------------+ +---------------------------+ |
 * +-------------------------------------------------------------+
 *
 */

;(function($){

	/**
	 * getSubtractedNums(num)
	 * Get the array with the number of rowspan subtracted.
	 * @param this (in) parent node of tr
	 * @param num (in) number to move
	 * @return array of number of column to move.
	 */
	var getSubtractedNums = function(num){
		var nums = new Array(this.children.length);
		/** Compatible with browsers where 'fill' is not defined */
		if(Array.prototype.fill){
			nums.fill(num);
		}
		else{
			for(var i = 0; i < this.children.length; i++){
				nums[i] = num;
			}
		}
		/** tr list */
		for(var i = 0; i < this.children.length; i++){
			var tr = this.children[i];
			/** th/td list */
			for(var j = 0; j < nums[i] && j < tr.children.length; j++){
				var td = tr.children[j];
				/** Subtract rowspan from number of column to move. */
				var colspan = td.colSpan - 1;
				for(var k = 1; k < td.rowSpan && i + k < nums.length; k++){
					nums[i + k] -= 1 + colspan;
				}
			}
		}
		return nums;
	}

	/**
	 * moveToNewTable(kind, num)
	 * Move rows/columns to a newly created table that inherits the source table/thead/tbody.
	 * The function treats the DOM object only, expect this.
	 * @param this (in) source table node
	 * @param kind (in) "row", "col"
	 * @param num  (in) number to move
	 * @return the created table
	 */
	var moveToNewTable = function(kind, num){
		/** Clone the node without children and id. */
		var src = this;
		var dst = src.cloneNode(false);
		dst.removeAttribute("id");
		/** If no move, return the clone node only. */
		if(num <= 0) return dst;
		/** Array of number of columns to move for each tr node. */
		var nums = null;
		/** Apply process for each child node. */
		for(var i = 0; i < src.children.length; i++){
			var elm = src.children[i];
			var tag = elm.nodeName.toLowerCase();
			/** Recall to subnodes (thead/tbody -> [tr], tr -> [th/td]). */
			if(tag == "thead" || tag == "tbody" || (tag == "tr" && kind == "col")){
				if(tag == "tr" && kind == "col"){
					if(nums == null){
						nums = getSubtractedNums.call(this, num);
					}
					num = nums[i];
				}
				var chld = dst.appendChild(moveToNewTable.call(elm, kind, num));
				if(kind == "row"){
					num -= chld.children.length;
					if(num <= 0) break;
				}
				if(tag != "tr" && elm.children.length <= 0){
					/** Compatible with browsers where 'remove' is not defined */
					elm.parentNode.removeChild(elm);
					i--;
				}
			}
			/** Move to destination node (row -> tr, col -> th/td). */
			else if(tag == "tr" || tag == "th" || tag == "td"){
				dst.appendChild(elm);
				i--;
				num -= (elm.colSpan || 1);
				if(num <= 0) break;
			}
		}
		return dst;
	}

	/**
	 * getWidthCols(row_num)
	 * @param this (in) table node
	 * @param row_nums (in) numbers of rows to get width.
	 * @return the array of width of all columns in the first row.
	 */
	var getWidthCols = function(row_num){
		var arr = [];
		$(this).find("tr:eq("+row_num+")").children().each(function(i,elm){
			arr.push($(elm).width());
		});
		return arr;
	}

	/**
	 * getHeightRows()
	 * @param this (in) table node
	 * @return the array of height of all rows.
	 */
	var getHeightRows = function(){
		var arr = [];
		$(this).find("tr").each(function(i,elm){
			arr.push(Math.ceil($(elm).height()));
		});
		return arr;
	}

	/**
	 * setWidthCols(arr, row_num)
	 * Set width of all columns in the first row.
	 * @param this (in) table node
	 * @param arr (in) width of columns
	 * @param row_nums (in) numbers of rows to set width.
	 * @return this.
	 */
	var setWidthCols = function(arr, row_num){
		$(this).find("tr:eq("+row_num+")").children().each(function(i,elm){
			setFixWidth.call($(elm), arr[i]);
		});
		return $(this);
	}

	/**
	 * reapplyWidthCols(row_num)
	 * Set width of all columns in the specified rows.
	 * @param this (in) table node
	 * @param row_nums (in) numbers of rows to set width.
	 * @return this
	 */
	var reapplyWidthCols = function(row_num){
		$(this).find("tr").slice(row_num[0],row_num[1]+1).each(function(i,tr){
			$(tr).children().each(function(j,elm){
				setFixWidth.call($(elm), Math.ceil($(elm).width()));
			});
		});
		return $(this);
	}

	/**
	 * setHeightRows(arr)
	 * Set height of all rows.
	 * @param this (in) table node
	 * @param arr (in) height of rows
	 * @return this.
	 */
	var setHeightRows = function(arr){
		$(this).find("tr").each(function(i,elm){
			setFixHeight.call($(elm), arr[i]);
		});
		return $(this);
	}

	/**
	 * setFixWidth(val)
	 * Set width/min-width/max-width of the node.
	 * @param this (in) target node
	 * @param val (in) width
	 * @return this.
	 */
	var setFixWidth = function(val){
		$(this).width(val);
		$(this).css({"min-width":val, "max-width":val});
		return $(this);
	}

	/**
	 * setFixHeight(val)
	 * Set height/min-height/max-height of the node.
	 * @param this (in) target node
	 * @param val (in) height
	 * @return this.
	 */
	var setFixHeight = function(val){
		$(this).height(val);
		$(this).css({"min-height":val, "max-height":val});
		return $(this);
	}

	/**
	 * createDummyRow(col_num)
	 * Create dummy row to fix width of columns.
	 * @param this (in) target node
	 * @param col_num (in) number of columns
	 * @return object of dummy row.
	 */
	var createDummyRow = function(col_num){
		var dummy = {};
		var $tr = $("<tr>");
		$(this).find("tr:first").children().each(function(i,elm){
			for(var j = 0; j < elm.colSpan; j++){
				$tr.append("<td>");
			}
		});
		$(this).find("tr:last").after($tr);
		var widths = [];
		$tr.children().each(function(i,elm){
			widths.push($(elm).width());
		});
		dummy.left_widths = widths.slice(0, col_num);
		dummy.right_widths = widths.slice(col_num);
		dummy.$right_tr = $tr.remove();
		dummy.$left_tr = $("<tr>").append($tr.find("td:lt("+col_num+")"));
		return dummy;
	}

	/**
	 * Body of table4panes.
	 */
	var table4panes_body = function(index, col_num, row_num, settings){

		/** Set the default class name prefix, if no prefix. */
		var prefix = "table4panes";
		if(settings && settings["prefix"]) prefix = settings["prefix"];
		var fix_width_rows = [0, row_num];
		if(settings && settings["fix-width-rows"]){
			fix_width_rows = settings["fix-width-rows"];
		}

		/** Decide IDs. */
		var id_table = $(this).attr("id");
		if(!id_table){ /** table has no ID */
			id_table = prefix+index;
			$(this).attr("id", id_table);
		}
		var id_table4panes = id_table + "-table4panes";
		var id_left = id_table + "-left";
		var id_right = id_table + "-right";
		var id_top_left = id_table + "-top-left";
		var id_bottom_left = id_table + "-bottom-left";
		var id_top_right = id_table + "-top-right";
		var id_bottom_right = id_table + "-bottom-right";

		/** Do not process if already applied. */
		if($("#"+id_table4panes).length > 0) return;

		/** Prepare to split the table. */
		$(this).css({"table-layout":"fixed"});
		$(this).addClass("pane");
		var dummy_row = null;
		if(fix_width_rows == "dummy"){
			dummy_row = createDummyRow.call($(this), col_num);
		}
		else{
			reapplyWidthCols.call($(this), fix_width_rows); /* Fix width of columns */
		}
		var row_heights = getHeightRows.call($(this)); /* Get height of rows */

		/** Wrap table with div node. */
		var $div_table4panes = $(this).wrap("<div id='"+id_table4panes+"'>").parent();

		/** Move rows/columns. Set height/width. Wrap with div node. */
		var $table_bottom_right = $(this);
		var $table_bottom_left = $(moveToNewTable.call($table_bottom_right[0], "col", col_num));
		var $div_right = $table_bottom_right.wrap("<div id='"+id_right+"'>").parent();
		var $div_left = $table_bottom_left.wrap("<div id='"+id_left+"'>").parent();
		setHeightRows.call($table_bottom_right, row_heights);
		setHeightRows.call($table_bottom_left, row_heights);
		var $table_top_right = $(moveToNewTable.call($table_bottom_right[0], "row", row_num));
		var $table_top_left = $(moveToNewTable.call($table_bottom_left[0], "row", row_num));

		/** Insert tables so that they are in the order of top left, bottom left, top right, bottom right. */
		$table_bottom_right.before($table_top_right);
		$table_bottom_left.before($table_top_left);
		$div_right.before($div_left);

		/** Insert the dummy rows to top of each pane. */
		if(dummy_row){
			$table_top_left.find("tr:first").before(dummy_row.$left_tr);
			setWidthCols.call($table_top_left, dummy_row.left_widths, 0);
			$table_bottom_left.find("tr:first").before(dummy_row.$left_tr.clone());
			setWidthCols.call($table_bottom_left, dummy_row.left_widths, 0);
			$table_top_right.find("tr:first").before(dummy_row.$right_tr);
			setWidthCols.call($table_top_right, dummy_row.right_widths, 0);
			$table_bottom_right.find("tr:first").before(dummy_row.$right_tr.clone());
			setWidthCols.call($table_bottom_right, dummy_row.right_widths, 0);
		}

		/** Wrap each tables with div node. */
		var $div_bottom_right = $table_bottom_right.wrap("<div id='"+id_bottom_right+"'>").parent();
		var $div_bottom_left = $table_bottom_left.wrap("<div id='"+id_bottom_left+"'>").parent();
		var $div_top_right = $table_top_right.wrap("<div id='"+id_top_right+"'>").parent();
		var $div_top_left = $table_top_left.wrap("<div id='"+id_top_left+"'>").parent();

		/** Add classes for each div nodes. */
		$div_table4panes.addClass(prefix);
		$div_right.addClass(prefix+"-right");
		$div_left.addClass(prefix+"-left");
		$div_top_left.addClass(prefix+"-top");
		$div_top_right.addClass(prefix+"-top");
		$div_bottom_left.addClass(prefix+"-bottom");
		$div_bottom_right.addClass(prefix+"-bottom");

		/** Set overflow style for each div node. */
		$div_bottom_right.css({"overflow-x":"scroll", "overflow-y":"scroll"});
		$div_top_right.css({"overflow-x":"hidden", "overflow-y":"scroll"});
		$div_bottom_left.css({"overflow-x":"scroll", "overflow-y":"hidden"});
		$div_top_left.css({"overflow-x":"hidden", "overflow-y":"hidden"});

		/** Set the side-by-side CSS property. */
		switch(settings["display-method"]){
		case "inline-block" :
			$div_left.css({"display":"inline-block"});
			$div_right.css({"display":"inline-block"});
			break;
		case "table-cell" :
			$div_table4panes.css({"display":"table", "table-layout":"fixed", "margin":"0 auto"});
			$div_left.css({"display":"table-cell"});
			$div_right.css({"display":"table-cell"});
			break;
		case "flex" :
			$div_table4panes.css({"display":"flex"});
			break;
		case "float" :
		default :
			$div_left.css({"float":"left"});
			break;
		}

		/** Set height/width from settings. */
		$.each(settings, function(param, value){
			switch(param){
			case "height" :
				setFixHeight.call($div_table4panes, settings[param]);
				break;
			case "top-height" :
				setFixHeight.call($div_top_left, settings[param]);
				setFixHeight.call($div_top_right, settings[param]);
				break;
			case "bottom-height" :
				setFixHeight.call($div_bottom_left, settings[param]);
				setFixHeight.call($div_bottom_right, settings[param]);
				break;
			case "width" :
				setFixWidth.call($div_table4panes, settings[param]);
				break;
			case "left-width" :
				setFixWidth.call($div_top_left, settings[param]);
				setFixWidth.call($div_bottom_left, settings[param]);
				break;
			case "right-width" :
				setFixWidth.call($div_top_right, settings[param]);
				setFixWidth.call($div_bottom_right, settings[param]);
				break;
			}
		});

		/** Fit the parent div container. */
		/** Recalculate height/width of bottom right when resizing. */
		if(settings["fit"]){
			var dw = $div_right.outerWidth(true)-$div_top_right.width();
			var dh = $div_bottom_left.outerHeight(true)-$div_bottom_left.height();
			$(window).resize(function(){
				var w = $div_table4panes.width()-$div_left.outerWidth(true)-dw;
				var h = $div_table4panes.height()-$div_top_left.outerHeight(true)-dh;
				setFixWidth.call($div_top_right, w);
				setFixWidth.call($div_bottom_right, w);
				setFixHeight.call($div_bottom_left, h);
				setFixHeight.call($div_bottom_right, h);
			});
			$(window).trigger('resize');
		}

		/** Set CSS properties from settings. */
		if(settings["css"]){
			$.each(settings["css"], function(sel, map){
				$(sel).css(map);
			});
		}

		/** Set event actions from settings. */
		if(settings["callbacks"]){
			$.each(settings["callbacks"], function(sel, actions){
				if(!$.isArray(actions)){
					actions = [actions];
				}
				$.each(actions, function(i, action){
					$(sel).on(action.event, action.data, action.func);
				});
			});
		}

		/** Set scroll events to move in sync. */
		$div_top_right.scroll(function(){
			$div_top_left.scrollTop($(this).scrollTop());
		});
		$div_bottom_left.scroll(function(){
			$div_top_left.scrollLeft($(this).scrollLeft());
		});
		$div_bottom_right.scroll(function(){
			$div_bottom_left.scrollTop($(this).scrollTop());
			$div_top_right.scrollLeft($(this).scrollLeft());
		});

		/** Return the top level node. */
		return $div_table4panes;
	}

	/**
	 * Call this function to split the table to four panes.
	 */
	$.fn.table4panes = function(col_num, row_num, settings){
		var top_nodes = [];
		$.each($(this), function(i, elm){
			top_nodes.push(table4panes_body.call($(elm), i, col_num, row_num, settings));
		});
		return top_nodes.length == 1 ? to_nodes[0] : top_nodes;
	}

})(jQuery);
