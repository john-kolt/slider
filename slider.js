(function($) {
    $.fn.removeClassWild = function(mask) {
        return this.removeClass(function(index, cls) {
            var re = mask.replace(/\*/g, '\\S+');
            return (cls.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
        });
    };
})(jQuery);


var Slider = function(config)
{
    var slider = this;

    slider.config = {
        root: '',
        buttons: false,
        buttonsStyle: {
            prev: {
                defaultClass: 'btn',
                text: ''
            },
            next: {
                defaultClass: 'btn',
                text: ''
            }
        },
        items: [{
            text: '',
            value: '',
            unselectable: false
        }],
        itemsStyle: {
            defaultClass: '',
            hiddenClass: 'hidden',
            visibleClass: 'visible',
            selectedClass: 'selected',
            selectableClass: 'selectable',
            unselectableClass: 'unselectable',
            value_attribute: 'data-slider-id'
        },
        itemsVisible: {
            beforeSelected: 1,
            afterSelected: 1
        },
        selected: 0,
        onSelect: null
    };

    slider._correct_view = function()
    {
        var root = $(slider.config.root);
        var itemsStyle = slider.config.itemsStyle;

        var select_ids = slider._select_ids();
        var show_before = slider.config.itemsVisible.beforeSelected;
        var show_after = slider.config.itemsVisible.afterSelected;

        // hide before
        for(var i = select_ids.select_start - show_before - 1; i >= 0; i--)
        {
            var item = root.find('['+ itemsStyle.value_attribute +'='+ i +']');
            if(i >= select_ids.select_start && i <= (select_ids.select_end === null ? select_ids.select_start : select_ids.select_end))
                item.addClass(itemsStyle.selectedClass);
            else
                item.removeClass(itemsStyle.selectedClass);
            item.removeClass(itemsStyle.visibleClass);
            item.removeClass(itemsStyle.selectedClass);
            item.addClass(itemsStyle.hiddenClass);
        }

        // hide after
        for(var i = (select_ids.select_end === null ? select_ids.select_start : select_ids.select_end) + show_after + 1; i < slider.config.items.length; i++)
        {
            var item = root.find('['+ itemsStyle.value_attribute +'='+ i +']');
            if(i >= select_ids.select_start && i <= (select_ids.select_end === null ? select_ids.select_start : select_ids.select_end))
                item.addClass(itemsStyle.selectedClass);
            else
                item.removeClass(itemsStyle.selectedClass);
            item.removeClass(itemsStyle.visibleClass);
            item.removeClass(itemsStyle.selectedClass);
            item.addClass(itemsStyle.hiddenClass);
        }

        // show
        var item = root.find('['+ itemsStyle.value_attribute +'='+ i +']');
        for(var i = select_ids.select_start - show_before; i <= (select_ids.select_end === null ? select_ids.select_start : select_ids.select_end) + show_after; i++)
        {
            var item = root.find('['+ itemsStyle.value_attribute +'='+ i +']');
            item.addClass(itemsStyle.visibleClass);
            item.removeClass(itemsStyle.hiddenClass);
            if(i >= select_ids.select_start && i <= (select_ids.select_end === null ? select_ids.select_start : select_ids.select_end))
            {
                item.addClass(itemsStyle.selectedClass);
                item.removeClassWild(itemsStyle.selectedClass + '_*');
                item.addClass(itemsStyle.selectedClass +'_'+ (i-select_ids.select_start));
                item.removeClass(itemsStyle.selectableClass);
            }
            else
            {
                item.removeClass(itemsStyle.selectedClass);
                item.removeClassWild(itemsStyle.selectedClass + '_*');
                if(!slider.config.items[i].unselectable)
                    item.addClass(itemsStyle.selectableClass);
            }
        }
    };

    slider._render = function()
    {
        var root = $(slider.config.root);
        root.html('');

        var buttons_styles = slider.config.buttonsStyle;

        var items = slider.config.items;
        var items_styles = slider.config.itemsStyle;

        if(slider.config.buttons)
        {
            var button_prev = $('<div class="'+ buttons_styles.prev.defaultClass +'">'+ buttons_styles.prev.text +'</div>');
            button_prev.click(function()
            {
                slider.selectPrev();
            });
            root.append(button_prev);
        }
        for(var i = 0; i < items.length; i++)
        {
            var item = $('<div class="'+ items_styles.defaultClass +' '+ (items[i].unselectable ? items_styles.unselectableClass : items_styles.selectableClass) +'" '+ items_styles.value_attribute +'="'+ i +'">'+ items[i].text +'</div>');

            if(!items[i].unselectable)
            {
                item.click(function()
                {
                    var id = parseInt($(this).attr(slider.config.itemsStyle.value_attribute));
                    slider.select(id);
                });
            }
            root.append(item);
        }

        if(slider.config.buttons)
        {
            var button_next = $('<div class="'+ buttons_styles.next.defaultClass +'">'+ buttons_styles.next.text +'</div>');
            button_next.click(function()
            {
                slider.selectNext();
            });
            root.append(button_next);
        }

        slider._correct_view();
    };

    slider._select_ids = function()
    {
        var select_start = null;
        var select_end = null;
        for(var i = 0; i < slider.config.items.length; i++)
        {
            if(Object.prototype.toString.call(slider.config.selected) === '[object Array]')
            {
                if(slider.config.items[i].value === slider.config.selected[0])
                {
                    select_start = i;
                }
                if(slider.config.items[i].value === slider.config.selected[slider.config.selected.length-1])
                {
                    select_end = i;
                }
            }
            else
            {
                if(slider.config.items[i].value === slider.config.selected)
                {
                    select_start = i;
                }
            }
        }

        return {
            select_start: select_start,
            select_end: select_end
        }
    };

    slider._select = function(modifier)
    {
        var count = (Object.prototype.toString.call(slider.config.selected) === '[object Array]') ? slider.config.selected.length : 1;

        var select_ids = slider._select_ids();
        var select_start = select_ids.select_start;
        var select_end = select_ids.select_end;

        if(Object.prototype.toString.call(slider.config.selected) === '[object Array]')
        {
            var select = [];

            for(var i = select_start + modifier; i <= select_end + modifier; i++)
            {
                if(slider.config.items[i].unselectable)
                    break;

                select[select.length] = slider.config.items[i].value;
            }

            if(select.length-1 == select_end-select_start)
            {
                slider.config.selected = select;
                if(slider.config.onSelect)
                {
                    if(typeof slider.config.onSelect == 'function')
                        slider.config.onSelect(slider.config.selected);
                    if(typeof slider.config.onSelect == 'object')
                        slider.config.onSelect.callback(slider.config.onSelect.context, slider.config.selected);
                }
            }
        }
        else
        {
            if(typeof slider.config.items[select_start+modifier] != 'undefined' && !slider.config.items[select_start+modifier].unselectable)
            {
                slider.config.selected = slider.config.items[select_start+modifier].value;
                if(slider.config.onSelect)
                {
                    if(typeof slider.config.onSelect == 'function')
                        slider.config.onSelect(slider.config.selected);
                    if(typeof slider.config.onSelect == 'object')
                        slider.config.onSelect.callback(slider.config.onSelect.context, slider.config.selected);
                }
            }
        }

        slider._correct_view();
    };

    slider.select = function(id)
    {
        var select_id = parseInt(id);

        var select_ids = slider._select_ids();
        var select_start = select_ids.select_start;
        var select_end = select_ids.select_end;

        if(select_id < select_start)
            return slider._select(select_id - select_start);

        if(select_end === null)
        {
            if(select_id > select_start)
                return slider._select(select_id - select_start);
        }
        else
        {
            if(select_id > select_end)
                return slider._select(select_id - select_end);
        }

        return null;
    };

    slider.set = function(value)
    {
        slider.config.selected = value;
        slider._correct_view();
    };

    slider.selectPrev = function() { slider._select(-1); };
    slider.selectNext = function() { slider._select( 1); };

    slider.init = function(config)
    {
        if(typeof config == 'object')
            slider.config = $.extend(true, slider.config, config);

        slider._render();
    };

    slider.init(config);

};
