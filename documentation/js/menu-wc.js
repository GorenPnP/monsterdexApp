'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Monsterdex</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Eingeben zur Suche"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Los geht&#x27;s</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Übersicht
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Abhängigkeiten
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-57fd0865881e92c73f5ca64e597183e5"' : 'data-target="#xs-components-links-module-AppModule-57fd0865881e92c73f5ca64e597183e5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-57fd0865881e92c73f5ca64e597183e5"' :
                                            'id="xs-components-links-module-AppModule-57fd0865881e92c73f5ca64e597183e5"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CalcTypPageModule.html" data-type="entity-link">CalcTypPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-CalcTypPageModule-e981245aadf7838d64af45cad19cb6d8"' : 'data-target="#xs-components-links-module-CalcTypPageModule-e981245aadf7838d64af45cad19cb6d8"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-CalcTypPageModule-e981245aadf7838d64af45cad19cb6d8"' :
                                            'id="xs-components-links-module-CalcTypPageModule-e981245aadf7838d64af45cad19cb6d8"' }>
                                            <li class="link">
                                                <a href="components/CalcTypPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CalcTypPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DetailAttackePageModule.html" data-type="entity-link">DetailAttackePageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DetailAttackePageModule-b2d222dcd5d61987f3d60d956e210de2"' : 'data-target="#xs-components-links-module-DetailAttackePageModule-b2d222dcd5d61987f3d60d956e210de2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DetailAttackePageModule-b2d222dcd5d61987f3d60d956e210de2"' :
                                            'id="xs-components-links-module-DetailAttackePageModule-b2d222dcd5d61987f3d60d956e210de2"' }>
                                            <li class="link">
                                                <a href="components/DetailAttackePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailAttackePage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DetailMonsterPageModule.html" data-type="entity-link">DetailMonsterPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DetailMonsterPageModule-5cf8e3213f3eeb086271cc2bb8913b28"' : 'data-target="#xs-components-links-module-DetailMonsterPageModule-5cf8e3213f3eeb086271cc2bb8913b28"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DetailMonsterPageModule-5cf8e3213f3eeb086271cc2bb8913b28"' :
                                            'id="xs-components-links-module-DetailMonsterPageModule-5cf8e3213f3eeb086271cc2bb8913b28"' }>
                                            <li class="link">
                                                <a href="components/DetailMonsterPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailMonsterPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ListAttackenPageModule.html" data-type="entity-link">ListAttackenPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ListAttackenPageModule-39ac6c93312a4371da100ce86b3f1abf"' : 'data-target="#xs-components-links-module-ListAttackenPageModule-39ac6c93312a4371da100ce86b3f1abf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ListAttackenPageModule-39ac6c93312a4371da100ce86b3f1abf"' :
                                            'id="xs-components-links-module-ListAttackenPageModule-39ac6c93312a4371da100ce86b3f1abf"' }>
                                            <li class="link">
                                                <a href="components/ListAttackenPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListAttackenPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ListMonsterPageModule.html" data-type="entity-link">ListMonsterPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ListMonsterPageModule-e776de2d7d07b04763fa44fca681c7bf"' : 'data-target="#xs-components-links-module-ListMonsterPageModule-e776de2d7d07b04763fa44fca681c7bf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ListMonsterPageModule-e776de2d7d07b04763fa44fca681c7bf"' :
                                            'id="xs-components-links-module-ListMonsterPageModule-e776de2d7d07b04763fa44fca681c7bf"' }>
                                            <li class="link">
                                                <a href="components/ListMonsterPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListMonsterPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ListTypenPageModule.html" data-type="entity-link">ListTypenPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ListTypenPageModule-09b3fa1871e4843079f6be089a7b4f14"' : 'data-target="#xs-components-links-module-ListTypenPageModule-09b3fa1871e4843079f6be089a7b4f14"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ListTypenPageModule-09b3fa1871e4843079f6be089a7b4f14"' :
                                            'id="xs-components-links-module-ListTypenPageModule-09b3fa1871e4843079f6be089a7b4f14"' }>
                                            <li class="link">
                                                <a href="components/ListTypenPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListTypenPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PopoverPageModule.html" data-type="entity-link">PopoverPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PopoverPageModule-8cc50d3dacc16ea56821ec918634e187"' : 'data-target="#xs-components-links-module-PopoverPageModule-8cc50d3dacc16ea56821ec918634e187"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PopoverPageModule-8cc50d3dacc16ea56821ec918634e187"' :
                                            'id="xs-components-links-module-PopoverPageModule-8cc50d3dacc16ea56821ec918634e187"' }>
                                            <li class="link">
                                                <a href="components/PopoverPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopoverPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/TabsPageModule.html" data-type="entity-link">TabsPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-TabsPageModule-4ac2fd0e8df2b19b35c865e08fdf11c6"' : 'data-target="#xs-components-links-module-TabsPageModule-4ac2fd0e8df2b19b35c865e08fdf11c6"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TabsPageModule-4ac2fd0e8df2b19b35c865e08fdf11c6"' :
                                            'id="xs-components-links-module-TabsPageModule-4ac2fd0e8df2b19b35c865e08fdf11c6"' }>
                                            <li class="link">
                                                <a href="components/TabsPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TabsPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Klassen</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AppPage.html" data-type="entity-link">AppPage</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/DatabaseService.html" data-type="entity-link">DatabaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DbAttackenService.html" data-type="entity-link">DbAttackenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DbImageService.html" data-type="entity-link">DbImageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DbMonsterService.html" data-type="entity-link">DbMonsterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DbTypenService.html" data-type="entity-link">DbTypenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FullHeaderService.html" data-type="entity-link">FullHeaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link">MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MinimalHeaderService.html" data-type="entity-link">MinimalHeaderService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Attacke.html" data-type="entity-link">Attacke</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Image.html" data-type="entity-link">Image</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Monster.html" data-type="entity-link">Monster</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Typ.html" data-type="entity-link">Typ</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Verschiedenes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Funktionen</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variablen</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Dokumentation Abdeckung</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Dokumentation generiert mit <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});