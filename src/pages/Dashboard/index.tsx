import { useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { useEffect } from 'react';


interface FoodType {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}
export default function Dashboard () {

  const [foods, setFoods] = useState<FoodType[]>([])
  const [editingFood, setEditingFood] = useState<FoodType>( {} as FoodType )
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get('/foods');
      
      setFoods(response.data)
    }

    loadFoods()
  }, []) 


  async function handleAddFood(food: Omit<FoodType, "id" | "available">) {

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });
    
      setFoods([...foods, response.data])

    } catch (err) {
      console.log(err);
    }

  }

  async function handleUpdateFood(food: Omit<FoodType, "id" | "available"> ) {

    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );
      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated)
      
    } catch (err) {
      console.log(err);
    }
    
  }

   async function handleDeleteFood(id: number) {

    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);

  }


  const toggleModal = () => {
    setModalOpen(!modalOpen);
  }

  const toggleEditModal = () => {

    setEditModalOpen(!editModalOpen)
  }

  const handleEditFood = (food: FoodType) => {
    setEditingFood(food)
    setEditModalOpen(true)    
  }

    return (
      <>
        <Header openModal={toggleModal} />
        <ModalAddFood
          isOpen={modalOpen}
          setIsOpen={toggleModal}
          handleAddFood={() => handleAddFood}
        />
        <ModalEditFood
          isOpen={editModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />

        <FoodsContainer data-testid="foods-list">
          {foods &&
            foods.map(food => (
              <Food
                key={food.id}
                food={food}
                handleDelete={() => handleDeleteFood(food.id)}
                handleEditFood={handleEditFood}
              />
            ))}
        </FoodsContainer>
      </>
    );
  }
