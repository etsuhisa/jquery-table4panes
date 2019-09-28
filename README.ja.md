# jQuery Table4Panes 1.1.0
HTML��ύX������JavaScript�݂̂Ńe�[�u����4�̃y�C���ɕ������܂��B

## �f��
�ȉ����Q�Ƃ��Ă��������B
* demo-jquery-table4panes.html
* demo-jquery-table4panes_span.html

## �g����

jQuery�Ƃ��̃v���O�C�����y�[�W�Ɋ܂߂Ă��������B

```html
<script src="jquery.min.js"></script>
<script src="jquery-table4panes.min.js"></script>
```

��������e�[�u���ɑ΂���table4panes�֐����Ăяo���܂��B
1�ڂ̈����ɗ񐔁A2�ڂ̈����ɍs�����w�肵�܂��B
�e��ݒ�(�\���T�C�Y��\�����@�Ȃ�)��3�ڂ̈����Ɏw�肵�܂��B

```js
$.fn.table4panes(col_num, row_num, settings)
```

## ��

4��3�s�ŌŒ肵��ʑS�̂ɕ\������ꍇ�́A�ȉ��̂悤�ɌĂяo���܂��B
```js
$(function(){
    $("#demo-table").table4panes(4,3,{"display-method":"flex", "width":"100%", "height":"100%", "fit":true});
});
```

## �ݒ�(��3����)

### "display-method"
"display-method"�I�v�V�����ɂ́ACSS�̉����т̕��@�Ƃ��Ĉȉ��̂����ꂩ���w��ł��܂��B
* "inline-block"
* "table-cell"
* "flex"
* "float"

### "fit"
true���w�肵���ꍇ�A�E���̃y�C�����e�̃m�[�h�Ƀt�B�b�g���܂��B

### �T�C�Y
�e�y�C���̃T�C�Y�͈ȉ��Ŏw��ł��܂��B
* �S�̂̃T�C�Y��"height"��"width"�Ŏw�肵�܂��B
* �e�y�C���̍�����"top-height"��"bottom-height"�Ŏw�肵�܂��B
* �e�y�C���̕���"left-width"��"right-width"�Ŏw�肵�܂��B

### "fix-width-rows"
��̕����Œ肷�邽�߂Ɏg�p����s�̐����w�肵�܂��B
�f�t�H���g�l��"row_num+1"�ł��B

### "callbacks"
���̃I�v�V�����́A�Z���N�^�ɑ΂�event/function/data���w�肵�A�e�C�x���g�ɑ΂���R�[���o�b�N���w�肵�܂��B

### "css"
���̃I�v�V�����̓Z���N�^�ɑ΂���CSS���w�肵�܂��B

### "prefix"
���̃I�v�V�����́A�N���X���̃v���t�B�b�N�X���f�t�H���g��"table4panes"����ύX���܂��B

## ���C�Z���X
Copyright &copy; ASAI Etsuhisa<br>
Licensed under the MIT license.

