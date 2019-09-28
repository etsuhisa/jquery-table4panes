/**
 * jquery-table4panes 1.1.0 - jQuery plugin to split the table to four panes.
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
 *   "fix-width-rows": num - Fix the width of columns with the specified number of rows.
 *   "callbacks": {"selector1": {"event":"event1", "func":"func1", "data":"data1"},
 *                 "selector2": {"event":"event2", "func":"func2", "data":"data2"}, ... } - Set the callbacks.
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
 * | | | +- table -----------+ | | | | +- table -----------+ | | |
 * | | | | col_num x row_num | | | | | | *** x row_num     | | | |
 * | | | +-------------------+ | | | | +-------------------+ | | |
 * | | +-----------------------+ | | +-----------------------+ | |
 * | | +- div bottom-left -----+ | | +- div bottom-right--- -+ | |
 * | | |      #id-bottom-left  | | | |      #id-bottom-right | | |
 * | | |      .prefix-bottom   | | | |      .prefix-bottom   | | |
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
		var nums = new Array(this.children.length).fill(num);
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
		var src = this;
		var dst = src.cloneNode(false);
		dst.removeAttribute("id");
		var nums = null;
		for(var i = 0; i < src.children.length && num > 0; i++){
			var elm = src.children[i];
			var tag = elm.nodeName.toLowerCase();
			if(tag == "thead" || tag == "tbody" || (tag == "tr" && kind == "col")){
				if(tag == "tr" && kind == "col"){
					if(nums == null){
						nums = getSubtractedNums.call(this, num);
					}
					num = nums[i];
				}
				dst.appendChild(moveToNewTable.call(elm, kind, num));
				if(kind == "row"){
					num -= dst.children.length;
				}
				if(elm.children.length <= 0){
					elm.remove();
					i--;
				}
			}
			else if(tag == "tr" || tag == "th" || tag == "td"){
				dst.appendChild(elm);
				i--;
				num -= (elm.colSpan || 1);
			}
		}
		return dst;
	}

	/**
	 * getHeightRows()
	 * @param this (in) table node
	 * @return the array of height of all rows.
	 */
	var getHeightRows = function(){
		var arr = [];
		$(this).find("tr").each(function(i,elm){
			arr.push($(elm).height());
		});
		return arr;
	}

	/**
	 * setWidthCols(row_num)
	 * Set width of all columns in the specified rows.
	 * @param this (in) table node
	 * @param row_num (in) number of rows to set width.
	 * @return this
	 */
	var setWidthCols = function(row_num){
		$(this).find("tr:lt("+row_num+")").each(function(i,tr){
			$(tr).children().each(function(j,elm){
				setFixWidth.call($(elm), $(elm).width());
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
	 * Call this function to split the table to four panes.
	 */
	$.fn.table4panes = function(col_num, row_num, settings){

		/** Set the default class name prefix, if no prefix. */
		var prefix = "table4panes";
		if(settings && settings["prefix"]) prefix = settings["prefix"];
		fix_width_rows = row_num + 1;
		if(settings && settings["fix-width-rows"]) fix_width_rows = settings["fix-width-rows"];

		/** Decide IDs. */
		var id_table = $(this).attr("id");
		var id_table4panes = id_table + "-table4panes";
		var id_left = id_table + "-left";
		var id_right = id_table + "-right";
		var id_top_left = id_table + "-top-left";
		var id_bottom_left = id_table + "-bottom-left";
		var id_top_right = id_table + "-top-right";
		var id_bottom_right = id_table + "-bottom-right";

		/** Prepare to split the table. */
		$(this).css({"table-layout":"fixed"});
		$(this).addClass("pane");
		setWidthCols.call($(this), fix_width_rows); /* Fix width of columns */
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
			$.each(settings["callbacks"], function(sel, action){
				$(sel).on(action.event, action.data, action.func);
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
})(jQuery);
