<article class="slds-setup-assistant__step" id="step-1">
    <div class="slds-setup-assistant__step-summary">
        <div class="slds-media">
            <div class="slds-media__figure">
                <div class="slds-progress-ring slds-progress-ring_large">
                    <div class="slds-progress-ring__content">1</div>
                </div>
            </div>
            <div class="slds-media__body slds-m-top_x-small">
                <div class="slds-media">
                    <div class="slds-setup-assistant__step-summary-content slds-media__body">
                    <h3 class="slds-setup-assistant__step-summary-title slds-text-heading_small">
                        <span style="text-transform: uppercase;">{$MOD.LBL_MB_GENERAL}</span>
                    </h3>
                    <div style="width: 70%; margin:0 auto;">
                        <div class="slds-form-element">
                            <label class="slds-form-element__label" for="modulename">
                                <abbr class="slds-required" title="required">* </abbr>{$MOD.LBL_MB_MODULENAME}
                            </label>
                            <div class="slds-form-element__control">
                                <input type="text" id="modulename" placeholder="{$MOD.LBL_MB_MODULENAME}" onchange="mb.checkForModule(this.id);mb.updateProgress(1)" required="" class="slds-input" />
                            </div>
                        </div>
                        <div class="slds-form-element">
                            <label class="slds-form-element__label" for="modulelabel">
                                <abbr class="slds-required" title="required">* </abbr>{$MOD.LBL_MB_MODULELABEL}
                            </label>
                            <div class="slds-form-element__control">
                                <input type="text" id="modulelabel" placeholder="{$MOD.LBL_MB_MODULELABEL}" onchange="mb.updateProgress(1)" required="" class="slds-input" />
                            </div>
                            </div>
                            <div class="slds-form-element">
                                <label class="slds-form-element__label" for="parentmenu">{$MOD.LBL_MB_PARENTMENU}</label>
                                <div class="slds-form-element__control">
                                    <div class="slds-select_container">
                                        <select class="slds-select" id="parentmenu" onchange="mb.updateProgress(1)">
                                            <option value="" disabled="" selected=""></option>
                                            {foreach from=$MENU item=m key=k}
                                            <option value="{$m}">{$m}</option>
                                            {/foreach}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="slds-form-element">
                                <label class="slds-form-element__label" for="moduleicon">{$MOD.LBL_MB_MODULEICON}
                                    <a href="https://www.lightningdesignsystem.com/icons/" class="slds-badge slds-theme_success slds-m-top_x-small slds-m-bottom_xx-small slds-m-left_small" target="_blank"> {$MOD.LBL_MB_LISTICONS}</a>
                                </label>
                                <div class="slds-form-element__control slds-grid slds-gutters">
                                <div class="slds-col slds-size_1-of-12">
                                    <span class="slds-icon_container slds-icon-utility-announcement" id="moduleiconshow">
                                        <svg class="slds-icon slds-icon-text-default">
                                            <use xlink:href="" id="moduleiconshowsvg"></use>
                                        </svg>
                                    </span>
                                </div>
                                <div class="slds-col slds-size_11-of-12">
                                    <select class="slds-select" id="moduleicon" onchange="mb.updateProgress(1);mb.showModuleIcon(this.value);">
                                        <option value="" disabled="" selected=""></option>
                                        {foreach from=$ICONS item=i key=k}
                                            <option value="{$i}">{$i}</option>
                                        {/foreach}
                                    </select>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br><br><br>
    <div class="slds-docked-form-footer">
        <button class="slds-button slds-button_success" disabled="true" onclick="mb.SaveModule(1);" id="btn-step-1" style="color: white">
            {$MOD.LBL_MB_NEXT}&nbsp;
            <svg class="slds-icon slds-icon--small" aria-hidden="true">
                <use xlink:href="include/LD/assets/icons/utility-sprite/svg/symbols.svg#forward"></use>
            </svg>
        </button>
    </div>
</article>