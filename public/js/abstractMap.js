/**
 * Класс AbstractMap используется в качестве родительского для дальнейшего наследования и создания кастомных карт.
 */
class AbstractMap {
  /**
   * Конструктор AbstractMap - используется дли инициализации начальных значений (параметров)
   * @param {object} params - начальные параметры для создания экземпляра карты
   * @param params.name {string} - имя карты
   * @param params.target {string} - идентификатор DOM элемента
   * @param params.layers {array} - массив слоев, включаемых в карту при начале работы
   * @param params.loadTilesWhileAnimating {boolean} - загружать тайлы при анимации
   * @param params.loadTilesWhileInteracting {boolean} - загружать тайлы при вызове взаимодействий
   * @param params.longitude {number} - стартовая долгота
   * @param params.latitude {number} - стартовая долгота
   * @param params.zoom {number} - уровень приближения
   * @param params.projection {string} - код проекции
   * @param params.renderer {string} - код рендерера - webgl, canvas (по умолчанию - webgl)
   */
  constructor(params) {
    this.initEvents(params);
    this.initStore(params);
  }

  initEvents(params) {
    this.events = {};
  }

  /**
   * Инициализация хранилища объекта карты
   * @param params
   */
  initStore(params) {
    this.params = params;
  }

  /**
   * Центрировать карту
   * @param params
   */
  center(params) {
  };

  /**
   * Уничтожить объект карты и ссылки на слои
   */
  destroy() {
    delete this.map;
  };

  /**
   * Получение текущей базовой карты
   */
  getBaseMap() {
  };

  /**
   * Получение описания карты
   */
  getDescription() {
    return this.description;
  };

  /**
   * Получение истории карты
   */
  getHistory() {
  };

  /**
   * Получение коллекции слое, зарегистрированных на карте
   */
  getLayers() {
  };

  /**
   * Получение текущей координаты курсора мыши
   */
  getMousePosition() {
  };

  /**
   * Получение имени карты
   */
  getName() {
  };

  /**
   * Получение текущего масштаба
   */
  getScale() {
  };

  /**
   * Включение слоев в группу
   */
  groupLayers(layers) {
  };

  /**
   * Скрытие карты
   */
  hide() {
  };

  /**
   * Идентификация объектов карты
   * @param params
   */
  identify(params) {
  };

  /**
   * Перемещение карты в заданную точку
   * @param params
   */
  panTo(params) {
  };

  /**
   * Печать содержимого карты
   */
  print() {
  };

  /**
   * Удаление слоя с карты
   */
  removeLayer(layer) {
  };

  /**
   * Изменение порядка слоев
   */
  reorderLayers(prevLayerIds, nextLayerIds) {
  };

  /**
   * Сохранение карты
   */
  save(params) {
  };

  /**
   * Сохранение карты как
   */
  saveAs(params) {
  };

  /**
   * Поиск объекто в карте по поисковой строке
   */
  search(params) {
  };

  /**
   * Назначение новой базовой карты
   * @param id
   */
  setBaseMap(id) {
  };

  /**
   * Присвоение описания объекту карты
   */
  setDescription(description) {
    this.description = description;
  };

  /**
   * Присвоение имнени
   */
  setName(name) {
    this.name = name;
  };

  setProjection(projection) {
    this.projection = projection;
  };

  setScale(scale) {
    this.scale = scale;
  };

  share() {
  };

  show() {
  };

  zoom() {
  };

  zoomToUserLocation() {
  };

  /**
   * Привязка событий и вызов обратной функции
   * @param eventName
   * @param func
   */
  on(eventName, func) {

  }

  /**
   * Отвязка события от объекта
   * @param eventName
   */
  off(eventName) {

  }

  /**
   * Создание события
   * @param eventName
   */
  emit(eventName) {

  }
}

module.exports = AbstractMap;
